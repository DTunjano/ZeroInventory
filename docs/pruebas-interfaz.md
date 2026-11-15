# Etapa 4 — Regresión automática de interfaz

Inicio: 15/11/2026, después de la aceptación explícita del cierre de etapa 3 sobre `98ee441`. Rama de trabajo: `codex/browser-regression`. La pasarela permanece aplazada; esta etapa no despliega servicios externos ni inicia la etapa 5.

## Entorno y ejecución

Playwright Test es una dependencia de desarrollo del frontend, fijada en su lockfile. Ejecuta Chromium en escritorio (1440×1000) y emulación móvil (390×664 según dispositivo configurado); la emulación usa Chromium, **no es una validación de Safari/iOS físico**. El idioma es es-CO y la zona America/Bogota. Cada prueba abre un contexto de navegador nuevo y sus datos de negocio tienen identidades ficticias únicas.

Desde `frontend`, con dependencias de ambos paquetes instaladas y PostgreSQL de este proyecto activo:

```powershell
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm typecheck:e2e
pnpm test:e2e
```

La primera instalación de Chromium descarga el navegador oficial. En Linux CI se usa `pnpm exec playwright install --with-deps chromium`. Para ejecutar solo un proyecto o filtrar un caso:

```powershell
pnpm test:e2e --project=chromium-desktop
pnpm test:e2e --project=chromium-mobile --grep "conflicto de versión"
```

No añadas otro separador `--`. No ejecutes `playwright test` directamente: la configuración lo rechaza sin el entorno aislado del lanzador. El comando estándar arranca todo lo necesario para las pruebas en una sola consola; las dos consolas de desarrollo y sus puertos habituales siguen funcionando.

## Ciclo y barreras de aislamiento

`frontend/package.json` llama `backend/scripts/test-browser.cjs`. Este lanzador:

1. Carga configuración de conexión sin mostrar secretos y compila backend.
2. Genera un nombre `zero_inventory_test_browser_<timestamp>_<12 hex>`, exige el prefijo exacto y que difiera de la base original; crea una base nueva, nunca vacía ni migra la habitual.
3. Aplica las mismas migraciones y compone AppModule en un TestingModule. Solo sustituye CLOUDINARY por un adaptador que rechaza operaciones externas; no simula la API, la DB, los guards ni las transacciones del negocio.
4. Crea cuentas ADMIN/EMPLOYEE ficticias con contraseña aleatoria por ejecución. Cada escenario prepara su cliente/dirección/proveedor/categoría/producto mediante la API real. Las operaciones objeto de prueba se ejecutan mediante controles de la interfaz; la preparación API se indica en la matriz.
5. Reserva puertos propios en 127.0.0.1, configura el origen CORS antes de cargar AppModule y compila el frontend con la URL de esa API. Su build privado está en `.local/browser-build/<id>`, separado del `dist` de desarrollo/entrega.
6. Sirve el build mediante Vite preview y ejecuta los dos proyectos con un worker, sin reintentos que oculten inestabilidad. El navegador bloquea solicitudes fuera de los dos orígenes locales y service workers. El hijo Playwright no recibe variables DB/JWT/Cloudinary/pgAdmin.
7. Si las pruebas pasan, ejecuta también `db:check` contra esa misma DB y exige salida correcta.
8. En `finally`, cierra sus servidores/conexiones, elimina únicamente la DB generada comprobando de nuevo identidad y ausencia posterior y retira su propio directorio de build. Un fallo en la prueba o en limpieza produce salida no cero. No mata procesos por puerto/nombre ni opera otros contenedores.

Necesita permiso CREATEDB, igual que la integración existente. El guard tiene una prueba independiente que rechaza base habitual, nombres de otros flujos e identificadores inyectados:

```powershell
# Desde backend
node --test scripts/browser-test-safety.test.cjs
```

No se almacena la sesión en un archivo reutilizable ni se usa una cuenta del usuario. No se cambia ninguna contraseña; el cambio personal ya fue aceptado en etapa 1 y conserva regresión de API. Las pruebas no suben medios ni ejecutan dinero real. No se simula que cargar un MP4 local sustituya la prueba real de Cloudinary ya completada.

## Matriz de recorridos

| Caso | Acciones comprobadas en UI | Preparación / comprobación complementaria |
| --- | --- | --- |
| AUT-01 | Credenciales inválidas, aviso y formulario conservado | Se exige respuesta HTTP 401 real |
| AUT-02/03/06 | Login CUSTOMER, recarga con refresh, rechazo de ruta ADMIN y logout | Refresh HTTP 201; otra visita privada vuelve a login |
| CAT agotado/vacío | Producto agotado sin acción de compra, búsqueda sin coincidencias y recuperación desde el mismo control | Ajuste previo por API a stock 0 en un producto ficticio propio |
| CAT/CAR/PED | Búsqueda, agregar, aumentar a 2, checkout EFECTIVO, carrito vacío, Mis pedidos y cancelación propia | Producto stock 10/precio 19.000; API confirma cancelado, pendiente anulado y stock repuesto |
| PED entrega/devolución | ADMIN aprueba, envía, entrega, recibe devolución completa y registra reembolso; historial de seis versiones | Checkout preparado por API; detalle final mantiene aprobado y estado DEVUELTO |
| PED intentos/cancelación | Rechazar, nuevo intento, aprobar y cancelar con reembolso pendiente | Checkout preparado por API; intento anterior visible |
| PED empleado | Ruta exclusiva rechazada, envío y entrega sin acciones financieras/cancelación | Checkout y aprobación previos por API |
| PED versión | Motivo conservado ante 409, actualizar/revisar y nueva cancelación | Una segunda sesión API cambia la versión mientras está abierto el diálogo |
| COM/INV | EMPLOYEE crea borrador, confirma recepción completa, consulta stock/saldo y vuelve a compra desde Kardex | API verifica que borrador no sumó stock; saldo final 13 |
| INV conflicto | Ajuste con motivo, conflicto, refresco sin perder motivo, baja y Kardex | Una segunda sesión API cambia saldo de 10 a 11; la UI termina en saldo 8 |
| REP | Reporte y descarga CSV con aprobados brutos y reembolsos separados | Se compara con snapshot API del mismo período, sin otras pruebas paralelas |
| NAV/CFG | Tema claro persistido tras recarga; en móvil menú, Escape, foco y ancho sin desbordamiento | Solo preferencias de cuenta ficticia; no cambia credenciales |

La preparación de un documento por API no se presenta como checkout UI; existe un caso separado que sí recorre checkout desde el catálogo. La concurrencia de última unidad, rollback inducido y autorizaciones HTTP detalladas siguen en las 67 integraciones PostgreSQL. Esta suite añade evidencia de interacción, sin sustituir esas pruebas ni prometer una auditoría completa de accesibilidad.

## Resultados, fallos y evidencias

Resultado: **24 pruebas correctas, sin reintentos**, correspondientes a los 12 recorridos de la matriz en escritorio y móvil. No hubo excepciones sin controlar en el navegador. El diagnóstico posterior de la DB de QA terminó sin migraciones pendientes ni inconsistencias; se retiró la DB y el directorio de build (cero directorios de ejecución restantes). La entrega técnica `2cb9e0f12dab27054cb5fcf3f35a46911367f631` está publicada en `dev` y `codex/fix-inventory-consistency`, con hashes remotos verificados y [GitHub Actions correcto](https://github.com/DTunjano/ZeroInventory/actions/runs/43686420276): backend, frontend y browser, incluida la conservación del reporte. La nota posterior de evidencia solo cambia documentación. Falta la aceptación del responsable; no se inicia etapa 5 antes de ella.

También pasaron tipos/ESLint/build de ambos paquetes, tipos de la suite, 33 unitarias backend, 67 de integración y 7 frontend, más una prueba del guard de DB y comprobaciones de sintaxis de los scripts. La ejecución directa de Playwright sin el entorno del lanzador fue rechazada, como se esperaba. La DB habitual conserva cero pendientes/inconsistencias nuevas y el aviso histórico de cinco pedidos ya aceptado en etapa 3. No se modificaron entidades ni migraciones en esta etapa.

Durante el desarrollo fallaron ejecuciones iniciales del lanzador por resolución de Babel desde el paquete equivocado y por configurar el origen CORS después de cargar la configuración validada de Nest. Se corrigieron los directorios/origen antes de la ejecución final, sin cambiar la configuración HTTP del producto. Otras fallas fueron localizadores que suponían un spinbutton donde había un textbox, un texto distinto del enlace de compra y cifras repetidas del reporte; se ajustaron a los controles reales, sin agregar sleeps ni reintentos. La limpieza de la DB se observó también después de esas ejecuciones fallidas.

Las capturas de devolución y tema se inspeccionaron. El único cambio de presentación del producto fue dar rol de artículo y nombre accesible a las tarjetas de catálogo, utilizado por navegación asistida y localizadores. No se añadieron botones de prueba ni rutas de reset a la aplicación.

Playwright genera `frontend/playwright-report/index.html`, capturas y trazas de fallos en `frontend/test-results/` y capturas de los estados clave de devolución/tema. Ambos directorios están excluidos de Git. Para consultar el reporte local, opcionalmente:

```powershell
pnpm exec playwright show-report
```

Ese visor es temporal y no forma parte del arranque de la aplicación. Las trazas solo contienen cuentas/credenciales de QA efímeras de una base ya retirada; no deben reutilizarse como sesiones reales. GitHub Actions ejecuta un job `browser` con PostgreSQL propio, instala ambos paquetes y Chromium, ejecuta la misma suite y conserva reporte/artefactos siete días. No publica un sitio ni abre un entorno de pruebas externo.

Referencias oficiales: [configuración de Playwright](https://playwright.dev/docs/test-configuration), [ejecución en GitHub Actions](https://playwright.dev/docs/ci-intro). Se usa un lanzador propio para que la DB, CORS, servicios y limpieza pertenezcan a una única ejecución y no se reutilice accidentalmente un servidor del usuario.
