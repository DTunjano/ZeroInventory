# Validación de las correcciones

Fecha: 12 de noviembre de 2026. Entorno local Windows/PowerShell, Node.js 24.11.0, pnpm 10.33.2, PostgreSQL 18.0 en Docker.

## Resultados

| Comprobación | Resultado observado |
| --- | --- |
| Instalación con lockfile congelado, ambos paquetes | Correcta; no se necesitó resolver dependencias fuera de los lockfiles |
| Backend `pnpm typecheck` | Correcto |
| Backend `pnpm lint` | Correcto, sin errores ni avisos de ESLint |
| Backend `pnpm test --runInBand` | 5 suites, **10 pruebas correctas** |
| Backend `pnpm test:integration` | 1 suite, **21 pruebas correctas**, DB temporal aislada |
| Reproducción en Node 22/Linux con PostgreSQL independiente | **10 unitarias y 21 de integración correctas**, build correcto; contenedores temporales retirados |
| Backend `pnpm build` | Correcto |
| Backend `pnpm test:upgrade` | Copia de DB real conservó las filas de las 21 tablas; saldos conciliados; repetición sin cambios |
| Backend `pnpm db:check` sobre la DB del proyecto | Sin migraciones pendientes, diferencias de stock ni números de pedido duplicados |
| Frontend `pnpm lint` | Correcto, sin errores ni avisos de ESLint |
| Frontend `pnpm build` | Correcto; incluye chequeo TypeScript |
| Backend real `pnpm start:dev` | Compiló sin errores, migraciones al día y API iniciada |
| Backend compilado `pnpm start:prod` | Arrancó con las credenciales locales actualizadas |
| HTTP API `/productos` y Swagger `/api/docs` | HTTP 200 |
| Especificación `/api/docs-json` | Esquema Bearer definido con el mismo nombre usado por los decoradores |
| `/usuarios` sin sesión | HTTP 401 |
| Vite real: `/`, `src/main.tsx`, `src/App.tsx`, pantalla de tienda | HTTP 200 y transformación correcta |
| Docker del proyecto | DB saludable en `127.0.0.1:5432`; pgAdmin en `127.0.0.1:8082` |
| Inicio de sesión pgAdmin tras rotación | Correcto, respuesta HTTP 302 de autenticación con formulario y CSRF válidos |
| `git diff --check` | Sin errores de espacios del cambio |

## Cobertura funcional de las 21 pruebas de integración

1. Migración de instalación vacía e idempotencia.
2. Lectura pública de catálogo y bloqueo de datos privados sin sesión.
3. Registro de clientes distintos y permisos del rol.
4. Rechazo de cantidades fraccionarias, precios negativos y campos no admitidos.
5. Creación de producto, SKU definitivo y saldo inicial consistente.
6. Aumentos y reducciones con Kardex y auditoría.
7. Endpoint de ajustes y rechazo de saldos esperados obsoletos.
8. Rollback de edición de producto si falla la auditoría.
9. Movimientos de stock atómicos y rechazo de sobregiro.
10. Dos clientes comprando simultáneamente la última unidad: una sola compra.
11. Checkout duplicado del mismo carrito: una sola compra.
12. Numeración única de pedidos para dos carritos concurrentes del mismo cliente.
13. Pedidos de 120 millones, superiores al antiguo límite monetario.
14. Cálculo exacto en centavos para precios fraccionarios.
15. Rollback de pedido, stock, Kardex y carrito cuando falla una escritura posterior.
16. Rechazo de una dirección de entrega ajena.
17. Login inválido, cookie HttpOnly, renovación y limpieza al cerrar sesión.
18. Consultas reales del dashboard y listado de ajustes.
19. Desactivación de producto sin borrar su historial.
20. Edición de direcciones por propietario y eliminación lógica de direcciones usadas por pedidos.
21. CORS con credenciales para el origen autorizado y ausencia de autorización para otro origen.

Las pruebas unitarias incluyen seguridad de cookie en desarrollo/producción y validación de secretos, además de los casos de producto, dashboard y ajustes.

## Límites y avisos

- La validación del frontend incluyó tipos, ESLint, build y respuestas HTTP de Vite. No se hizo una revisión visual manual de todas las pantallas en un navegador.
- No se hicieron cargas reales de archivos a Cloudinary ni operaciones con un procesador de pagos externo. El proyecto registra pagos internos.
- Vite mostró un aviso informativo de tiempo empleado en Babel/React Compiler. No bloquea el build. La carga por rutas redujo el archivo inicial de aproximadamente 1.39 MB a 442 kB antes de gzip, y el build dejó de avisar por chunks superiores a 500 kB.
- El dataset de compatibilidad de Browserslist instalado puede mostrar un aviso de antigüedad en desarrollo. No se alteraron dependencias ajenas al cambio para ocultarlo.
- En el entorno aislado de ejecución, la primera instancia Vite no podía resolver/acceder correctamente a dependencias y al puerto del host. Se repitió fuera de ese aislamiento y las mismas fuentes respondieron correctamente sin ajustes de código para ese problema.
- El push original se reprodujo con `--dry-run` y fue rechazado por divergencia. Los resultados locales anteriores no dependen de GitHub Actions. El workflow añadido ejecuta sus propios controles al publicarse; no se atribuye a CI un resultado que no se haya consultado.

## Conservación y limpieza

Las pruebas crearon y eliminaron únicamente bases temporales con prefijo `zero_inventory_test_`. No insertaron clientes de prueba en la DB del usuario. El respaldo previo de PostgreSQL y el de configuración de pgAdmin permanecen en `.local/backups`, fuera de Git.

Los procesos Node iniciados para comprobar el arranque se detuvieron al terminar. Los servicios Docker del proyecto permanecen activos para que el usuario inicie backend y frontend desde sus dos consolas.

## Revisión funcional posterior — etapa 1 en curso

La evidencia de interfaz del 12 de noviembre de 2026 está en [revision-funcional-mvp.md](revision-funcional-mvp.md). Se verificaron recorridos con tres perfiles ficticios en una base independiente y se corrigieron navegación móvil, acceso desde Home por rol, rótulo del método de pago y paginación de medios vacíos. Después del cambio pasaron `pnpm typecheck`, `pnpm lint` y `pnpm build` del frontend. No se repitieron las suites del backend porque sus fuentes y el esquema no cambiaron.

Esta revisión parcial no cierra el MVP: hay decisiones de alcance y casos de interfaz pendientes. Se detuvieron los procesos de revisión y se comprobó la retirada de su DB temporal, conservando los datos habituales. La pasarela de pagos no se ha incorporado.

## Continuación de etapa 1 — usuarios/roles y catálogo aprobados

Se incorporaron la gestión de usuarios/roles y las reglas de catálogo acordadas por el usuario. Los reportes avanzados quedan fuera del MVP. Los contratos y las garantías se describen en [usuarios-y-productos.md](usuarios-y-productos.md).

| Control | Resultado |
| --- | --- |
| Backend: tipos, ESLint, unitarias y build | Correctos; 10 pruebas unitarias |
| Integración HTTP/PostgreSQL | **28 pruebas correctas** sobre base temporal |
| Actualización de copia de la DB | 21 tablas de negocio conservadas, conciliación correcta y segunda ejecución sin cambios |
| Diagnóstico de DB habitual | Sin migraciones pendientes, diferencias de stock ni números duplicados |
| Frontend: tipos, ESLint y build | Correctos; aviso informativo de tiempo de Babel |
| Interfaz de cuentas | Alta, edición de roles, búsqueda, filtro inactivo, desactivación/reactivación y rechazo de desactivar al último administrador comprobados |
| Interfaz de productos | Alta/edición sin imagen, precio cero rechazado, categoría persistida y desactivación/reactivación comprobados |
| Interfaz móvil de usuarios | Documento de 390 px, contenido de aproximadamente 390 px, enlaces de gestión ausentes para empleado |
| Limpieza | Sesiones cerradas, procesos de revisión detenidos y DB temporal de la sesión retirada |

Las siete pruebas de integración añadidas cubren campos obligatorios e imagen opcional; rollback de producto/stock/auditoría al fallar categorías; protección del último administrador por cuentas y asignaciones históricas; edición de contraseña con bcrypt y respuestas sin hashes; roles inválidos/permisos/rollback de alta incompleta; degradación concurrente de administradores; y atomicidad de estados empleado/cuenta.

El acceso comprueba roles y cuenta activa en cada solicitud; no se añadieron sesiones persistentes ni revocación por dispositivo. No hubo cambios de esquema ni migraciones nuevas. No se cargaron medios al Cloudinary real. La matriz mantiene casos pendientes y no se declara cerrada la etapa 1. Etapa 2 y pasarela de pagos sin iniciar.

## Rondas de cierre funcional y protección de medios

- Backend: tipos, lint, build y **19 pruebas unitarias** correctos; integración final **34 pruebas** sobre DB aislada. Las nuevas regresiones incluyen registro concurrente sin huérfanos, alta atómica de empleado, filtros/orden/propiedad de pedidos, proveedores inactivos e imágenes falsas/ausentes/mayores de 5 MB.
- Frontend: tipos, lint y build correctos. Recorridos ampliados y límites en [revision-funcional-mvp.md](revision-funcional-mvp.md).
- Medios: las pruebas unitarias simulan fallos de proveedor y DB, comprobando conservación del recurso anterior y limpieza del nuevo. Videos se eliminan con `resource_type: video`; firmas de MP4/WebM verificadas antes de subir. No hubo cargas reales de video.
- Cloudinary real: se subió únicamente el PNG ficticio autorizado (32×32); el navegador comprobó sus dimensiones al cargarlo. El borrado de ese recurso fue bloqueado por revisión automática y se solicitó autorización expresa; su estado de limpieza debe consultarse en la última nota de la revisión funcional.
- No se modificó el esquema ni se añadieron servicios obligatorios. La prueba de actualización y el diagnóstico previamente registrados siguen aplicando a las migraciones sin cambios.
- La aceptación de etapa 1 permanece pendiente; el trabajo de etapa 2 y la pasarela siguen aplazados.

La retirada del PNG QA fue posteriormente autorizada expresamente y completada. Se comprobó ausencia del recurso en Cloudinary y cero referencias en la DB temporal; después se retiró esa DB y se detuvieron los procesos. El diagnóstico final de la DB habitual no encontró migraciones pendientes ni inconsistencias de stock/duplicados. No se eliminaron recursos anteriores ni datos de negocio reales.

## Validación de REP-01, MED-02 y CFG-01 — 12 de noviembre de 2026

- Backend: tipos, lint, build y 24 unitarias correctos. Integración PostgreSQL aislada: 38 casos, incluyendo reportes/permisos/rangos/agregados sin duplicación y ocultación pública de medios inactivos. Las consultas del reporte se secuenciaron dentro de su snapshot para evitar el aviso de concurrencia del cliente pg.
- Frontend: tipos, lint, build y 7 unitarias correctos. Dos regresiones de CSV (fórmulas/estructura) y cinco de orden de catálogo que incluyen agotados y conservación de la lista original. CI ejecuta `pnpm test:unit`.
- Navegador: reportes con 2 pedidos ficticios/$31.000, pagos aprobados $19.000 y pendientes $12.000; CSV descargado y leído con esos mismos valores; vacío y rango excesivo; tema claro/oscuro persistidos tras recarga; vistas móviles de 390 px y controles/etiquetas legibles. Catálogo por nombre/stock en ambas direcciones validado después de corregir la prioridad de disponibilidad.
- Cloudinary real: único MP4 ficticio autorizado de 57.919 bytes, 2 s, 320×180, sin audio; creado vía API de DB temporal, reproducción real desde Home, edición y desactivación/reactivación desde UI. Se retiró exclusivamente ese recurso, se validaron dimensiones/duración/tipo antes del borrado y 404 después. No se modificaron recursos anteriores.
- `pnpm db:check`: sin migraciones pendientes, diferencias de stock ni números duplicados. El sandbox no permitió una primera ejecución/conexión; repetir con acceso autorizado a PostgreSQL produjo el diagnóstico correcto. No se modificó la DB habitual.
- Sin esquema nuevo; prueba de actualización previa conserva su validez sobre las mismas migraciones. Build muestra avisos informativos de Browserslist antiguo y tiempo de Babel; no se añadieron dependencias de aplicación.
- El usuario completó personalmente el cambio de contraseña desde UI y confirmó «Prueba realizada». El agente comprobó contraseña anterior rechazada (401) y nueva aceptada (201), además de ambos recorridos de login en navegador; entrada a Tienda correcta. La sesión y pestaña se cerraron, los procesos de QA se detuvieron y la DB temporal fue retirada (cero bases de esa sesión). Aceptación final pendiente; etapa 2 sin iniciar. Esta última comprobación no cambió código de aplicación ni requiere repetir las pruebas técnicas ya aprobadas.

## Aceptación del cierre funcional

El 12/11/2026 el usuario aceptó expresamente el cierre de la etapa 1 y autorizó integrar en `dev` y continuar con la etapa 2. Todas las pruebas y limpiezas indicadas arriba se completaron antes de esa aceptación. No hubo cambios adicionales de código por registrar esta decisión.

El cierre aceptado se publicó sin force push en `dev` y `codex/fix-inventory-consistency`, hash remoto comprobado `4e2779c81b31ed6e7d630c332c0579fd329dad17`. [GitHub Actions](https://github.com/DTunjano/ZeroInventory/actions/runs/43367038473) completó la validación con resultado `success` para ese commit.

## Inicio de etapa 2 — ajustes e inspección de compras

En `codex/inventory-lifecycle`, el cálculo de valoración de ajustes usa centavos y valida el total antes de persistir. Tipos/lint/build backend, 24 unitarias y 40 de integración correctos. Prueba de copia real: 21 tablas conservadas e idempotencia; diagnóstico habitual sin pendientes/inconsistencias/duplicados. No se aplicaron migraciones nuevas. Frontend sin cambios en este avance.

La inspección de compras fue de solo lectura y devolvió únicamente columnas/restricciones y conteos agregados. Se documentaron las decisiones solicitadas y garantías pendientes en `docs/ciclo-inventario.md`; no se presume un modelo de recepción completa/parcial antes de la respuesta del responsable. La etapa 2 sigue abierta.

## Entrega técnica de etapa 2 — 14 de noviembre de 2026

El usuario aprobó el 13/11 borrador sin stock y recepción completa posterior. Se implementaron compras con líneas/versiones/snapshots, recepción transaccional e idempotente, cancelación de borrador con motivo, lectura paginada de Kardex y formulario de ajustes. Matriz y contrato en [ciclo-inventario.md](ciclo-inventario.md).

| Validación | Resultado |
| --- | --- |
| Backend: tipos, ESLint y build | Correctos |
| Backend: unitarias | 33 correctas en 9 suites |
| HTTP/PostgreSQL aislado | 54 correctas: recepción concurrente, edición concurrente, rollback de entradas/eventos, roles, versiones, adopción LEGACY, fechas y páginas sin duplicación, además de regresiones existentes |
| Frontend: tipos, ESLint, unitarias y build | Correctos; 7 unitarias de CSV/orden de catálogo; las nuevas pantallas tienen recorrido manual, no suite E2E automatizada todavía |
| Copia de actualización | 22 tablas conservadas, saldos conciliados y segunda ejecución sin migraciones |
| Instalación habitual | Tres migraciones nuevas aplicadas después de respaldo verificado y prueba aislada; diagnóstico final sin pendientes ni inconsistencias de stock, numeración, totales, recepción o versiones |
| DB temporal con compras/ajustes | El mismo diagnóstico confirmó integridad después de crear, editar, recibir, cancelar y compensar ajustes |
| UI: Compras | ADMIN/EMPLOYEE crean y reciben; ADMIN cancela con motivo; CUSTOMER sin acceso; filtros, vacío, páginas, historial y enlace directo comprobados |
| UI: inventario | Bajas con motivo, rechazo de saldo obsoleto, refresco/reintento conservando motivo, Kardex en dos páginas y saldo 11 = stock 11; edición de descripción conserva cantidad |
| UI: fechas y proveedor | Filtro de auditoría por día, actor/motivo/fecha; actividad nueva de dashboard con la misma hora de Kardex; proveedor suma solo 9 unidades recibidas |
| UI: apariencia | Móvil 390 px, escritorio, claro/oscuro; etiquetas de auditoría legibles en claro; retirado filtro redundante que desenfocaba el contenido de diálogos |
| Limpieza | Cuenta ficticia cerrada, viewport restaurado y pestaña de revisión cerrada; API/Vite de QA detenidos y DB de esa sesión retirada, verificado `reviewDatabaseRemaining: 0` |

El último respaldo custom privado, previo a la migración de auditoría, tiene 83.359 bytes y su catálogo de archivo fue verificado. Se conservaron los respaldos anteriores. No se borraron filas de negocio, medios existentes ni volúmenes. No se hicieron nuevas cargas externas ni cambios en otros proyectos Docker; `postgres-zero-inventory` y pgAdmin quedan activos.

Durante la verificación se corrigieron dos defectos adicionales: dashboard leía la fecha antigua pese a existir un instante nuevo, y auditoría no limitaba las filas de `getRawMany` usando `skip/take`. La regresión nueva comprueba el instante sobre una fecha antigua distinta, y tres páginas de una fila sin repetir IDs. Las primeras ejecuciones de esas pruebas detectaron problemas en su mock/lectura de RETURNING; se corrigieron y la suite final completa pasó. No se cuentan las ejecuciones fallidas como aprobadas.

Límites: fechas históricas sin zona conservan el fallback previo; no se certifica su zona ni se calcula costo promedio contable. La DB habitual no tenía cabeceras de compra antiguas: LEGACY tiene evidencia de integración y copia preparada antes de aplicar el ciclo, no una operación manual sobre un documento real. El navegador emitió avisos iniciales de tamaño de Recharts; el panel renderizó correctamente. Build conserva avisos informativos de Browserslist antiguo y tiempo de Babel. No se añadieron dependencias ni se incorporó una pasarela.

La entrega técnica no sustituye la aceptación del responsable. La etapa 2 espera esa aceptación; la etapa 3 permanece sin iniciar. El estado remoto/CI de la publicación debe comprobarse por el commit entregado, sin atribuir a esta entrega el CI previo de etapa 1.

## Aceptación del ciclo de inventario — 14/11/2026

El usuario aceptó «Acepto el cierre y continuar con etapa 3». Se cierra la etapa 2 sobre `99406e0603dccc827e097218421e0b04316d9ae4`, publicado en `dev` y `codex/fix-inventory-consistency`; ambos hashes remotos se comprobaron. [GitHub Actions](https://github.com/DTunjano/ZeroInventory/actions/runs/43655149323) terminó con `success` para ese commit (también pasó la ejecución 43655145545). Esta aceptación no cambia código ni esquema y no requiere repetir las suites ya aprobadas. Comienza la definición de la etapa 3; la pasarela sigue aplazada.
