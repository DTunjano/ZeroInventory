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
- Contraseña desde UI pendiente de acción del usuario según la política de control del navegador. Aceptación final pendiente; la DB temporal se conserva para ese único recorrido. El agente no cambió una credencial mediante UI ni declaró cierre de etapa 1/avance a etapa 2 anticipadamente.
