# Guía de trabajo para agentes — ZeroInventory

Este archivo aplica a todo el repositorio. Léelo antes de modificar código, configuración, esquema o documentación. Describe convenciones y riesgos reales de este proyecto; las instrucciones explícitas del usuario y las instrucciones de mayor prioridad prevalecen.

## Objetivo y alcance del producto

ZeroInventory combina administración de inventario con una tienda para clientes. Existen tres roles: `ADMIN`, `EMPLOYEE` y `CUSTOMER`. Las funcionalidades activas incluyen catálogo, productos, imágenes y categorías, proveedores, inventario y auditoría, empleados, usuarios, direcciones, carrito, checkout, pedidos, pagos internos, dashboard, configuración y medios promocionales.

No confundir la existencia de una carpeta o de un repositorio CRUD con una funcionalidad publicada: el registro en `backend/src/app.module.ts` y las rutas en `frontend/src/App.tsx` determinan qué se ejecuta.

## Entorno y límites de operación

1. Trabaja en el checkout actual salvo que el usuario solicite otro. Comprueba `git status --short --branch`, ramas y remoto antes de editar.
2. Preserva cambios previos del usuario. No uses resets destructivos ni sobrescribas conflictos sin leer ambas versiones.
3. El proyecto tiene dos paquetes independientes, con pnpm y lockfiles separados. Instala en `backend` y `frontend`, nunca en la raíz. Conserva pnpm 10 y Node >=22.12; la revisión inicial se validó con Node 24.11.
4. El flujo de desarrollo debe continuar con **dos consolas**: backend (que también permite iniciar Docker en segundo plano) y frontend. No agregues un tercer servicio obligatorio ni exijas un orquestador nuevo para arrancar.
5. El contenedor de la DB es `postgres-zero-inventory`, servicio `db`, proyecto Compose `zeroinventory`, puerto local 5432. pgAdmin opcional es `pgadmin-zero-inventory` en 8082. No operes contenedores de ForestGuard, OrderGo u otros proyectos.
6. No elimines volúmenes, tablas, filas de negocio ni bases existentes para hacer pasar compilaciones, migraciones o Git. Las pruebas tienen su propia DB temporal.
7. No publiques credenciales, registros personales, dumps ni tokens en herramientas, logs, capturas, commits o documentación. Muestra solamente nombres de variables y diagnósticos agregados.
8. Un error de conexión o de permisos del entorno no demuestra un defecto del código. Registra el error real y distingue restricciones del entorno de fallos reproducidos.

## Lecturas iniciales

- `docs/plan-de-trabajo.md` y `docs/revision-funcional-mvp.md`: etapa activa, criterios de cierre y decisiones pendientes.

- `README.md`: arranque, variables, migraciones, validaciones y versionado.
- `docs/database-schema.md`: tablas, columnas, enums y claves foráneas.
- `docs/diagnostics.md`: causas de los problemas históricos comprobados.
- `docs/validation.md`: evidencia de validación de esta revisión y sus límites.
- `backend/src/app.module.ts`, `backend/config/database.config.ts` y `backend/config/environment.ts`.
- `frontend/src/App.tsx`, `frontend/src/infrastructure/http/http.ts` y los archivos del módulo afectado.
- Ambos `package.json` y lockfiles cuando se cambien dependencias.

No vuelvas a leer secretos para contestar preguntas que pueden resolverse con nombres de variables, metadatos o consultas agregadas.

## Secuencia de trabajo actual

El usuario pidió avanzar en orden por seis etapas. La **etapa 1 quedó cerrada y aceptada el 12/11/2026** con el mensaje «Acepto el cierre y continuar con etapa 2». Está activa la **etapa 2: ciclo del inventario**. No inicies la etapa 3 sin documentar el cierre de la etapa 2 y su aceptación por el usuario. Ejecutar manualmente un recorrido existente no equivale a iniciar la implementación de una etapa futura.

La pasarela de pagos está aplazada explícitamente. Puede documentarse la posibilidad de simulación, pero no deben añadirse integraciones, SDKs, endpoints, webhooks, claves, migraciones ni métodos de pago de un proveedor hasta una autorización posterior específica.

Registra en la matriz qué se probó desde la interfaz, qué solo tiene evidencia API y qué continúa pendiente. Usuarios/roles forman parte del MVP y ya tienen pantalla funcional; REP-01 se incorporó al cierre por una petición posterior del usuario; ver `docs/reportes.md`. No declares la etapa cerrada con casos del alcance aún sin ejecutar. Las reglas aprobadas están en `docs/usuarios-y-productos.md`.

## Arquitectura real

La aplicación es un **monolito modular** con API REST NestJS y SPA React. No es una arquitectura de microservicios. Los módulos se organizan por capacidades del negocio y aplican principios de Clean Architecture con puertos de repositorio y adaptadores.

Dependencias deseadas:

```text
presentación / controlador → aplicación / caso de uso → dominio / contrato
infraestructura / repositorio → contrato de dominio
configuración del módulo → vincula contrato con implementación
```

El dominio no debe depender de React, Axios, HTTP, controladores ni decoradores ORM. Los casos de uso coordinan reglas y contratos; los controladores traducen HTTP; la infraestructura implementa persistencia y servicios externos. La composición Nest configura los providers.

Existen excepciones históricas: algunos contratos importan DTOs de aplicación; consultas de dashboard e inventario y el checkout usan `DataSource` en el caso de uso. No copies esas dependencias indiscriminadamente. Para cambios localizados mantén compatibilidad; al refactorizar, mueve consultas/transacciones detrás de un puerto sin cambiar contratos HTTP accidentalmente. No hagas una reescritura arquitectónica ajena al pedido del usuario.

## Backend: estructura y reglas

- Framework: NestJS 11, TypeScript 5, plataforma Express.
- `domain/entity`: entidades de dominio; `domain/repository` o `domain/port`: contratos.
- `application/use-cases` o carpetas históricas equivalentes: coordinación de casos de uso.
- `application/dto`: entradas HTTP validadas. `adapters/controllers` y `interfaces`: controladores.
- `infrastructure/persistence`: entidades ORM y repositorios; `infrastructure/mappers`: conversión explícita.
- `backend/infrastructure`: conexión PostgreSQL y Cloudinary compartidos.
- `backend/config`: configuración compartida por Nest y los comandos CLI.

Para añadir una funcionalidad, extiende el módulo existente apropiado. Registra providers e imports en su módulo; expón únicamente contratos o casos de uso que otros módulos necesitan. Evita usar `require()` para resolver inyección; importa `ConfigService` normalmente.

Los controladores no deben calcular precios, alterar stock ni abrir varias escrituras independientes. Valida IDs con `ParseIntPipe`, entradas con DTOs y deja que las excepciones de negocio produzcan estados HTTP correctos. No conviertas cualquier error en 404 ni ocultes fallos de auditoría con un log de éxito.

La configuración HTTP común está en `backend/config/http.config.ts`. Las pruebas de API la reutilizan: si cambias pipes, cookies, CORS o filtros, conserva una sola implementación.

### Identificadores y mappers

- PostgreSQL genera las PK. Los objetos nuevos del dominio pueden utilizar `0` como marcador; **el mapper no debe persistir ese 0** en una PK generada.
- En `toPersistence`, copia la PK únicamente si representa una identidad existente positiva.
- No apliques esa regla a las claves foráneas como `usuarioId` de un cliente: deben preservarse y validarse.
- Normaliza `numeric` al pasar al dominio o al calcular; PostgreSQL/pg puede devolverlo como cadena.
- No expongas hashes de contraseña en respuestas públicas. Revisa serializers/mappers si cambias usuarios o empleados.

### Seguridad y sesiones

- `ApiAccessGuard` es global. Una ruta nueva está protegida por defecto; sin `@Roles`, admite `ADMIN` y `EMPLOYEE`.
- Usa `@Public()` solamente en lecturas públicas o endpoints de autenticación definidos. Nunca marques un controlador administrativo entero como público.
- Declara los roles explícitamente en funcionalidades sensibles. Usuarios, roles y asignaciones requieren `ADMIN`; rutas propias de carrito, pedidos y direcciones requieren `CUSTOMER`.
- Revisa autorización de propiedad además del rol. El cliente no puede leer, cambiar o borrar direcciones de otro cliente ni usar una dirección ajena al confirmar compra.
- La estrategia JWT consulta cuenta activa y roles actuales por solicitud; conserva esa comprobación para que los cambios de acceso sean efectivos con tokens ya emitidos. No la confundas con revocación de sesiones individuales.
- Las respuestas de usuarios excluyen `password`. En altas/ediciones administrativas, cifra contraseñas con bcrypt y conserva el hash cuando se omite el campo. Los DTOs Swagger de respuesta no heredan el campo de contraseña.
- Cuenta, roles y perfil CUSTOMER nuevo se guardan en una transacción. Un perfil CUSTOMER nuevo necesita documento; no inventes uno ni reemplaces perfiles existentes. Los tipos de rol son fijos.
- Cuentas, asignaciones históricas y cambios de estado de empleados comparten `pg_advisory_xact_lock(4971, 0)` y conservan al menos un ADMIN activo. No escribas esas operaciones con repositorios fuera de la transacción. Empleado/cuenta cambian de estado juntos desde las acciones de Empleados.
- Usa el `usuarioId` autenticado para auditoría; no lo aceptes como identidad confiable del cuerpo.
- JWT de acceso y renovación usan secretos distintos de al menos 32 caracteres. No vuelvas a introducir el nombre genérico `JWT_SECRET`.
- El token de acceso está en memoria del frontend; la renovación usa cookie HttpOnly. No guardes tokens en localStorage.
- Producción usa cookie segura. `SameSite=None` exige `Secure`; CORS debe permitir orígenes concretos y credenciales.
- Logout limpia la cookie con las mismas opciones de ruta/SameSite/Secure usadas al crearla.
- El sistema actual no tiene sesiones persistentes ni revocación de JWT. Si se requiere cierre inmediato en todos los dispositivos, implementa una política de revocación y sus migraciones/pruebas; no afirmes que ya existe.

### Persistencia e integridad

Usa parámetros en SQL y QueryBuilder. No interpoles entradas del usuario como identificadores, expresiones, nombres de tabla ni ordenamiento. Las interpolaciones de identificadores existentes en migraciones y diagnósticos deben provenir de listas constantes o metadatos internos.

Mantén `synchronize: false` y `migrationsRun: false`. La aplicación no debe hacer DROP/ADD automáticos al arrancar. `start:dev` llama al comando explícito de migración antes de iniciar Nest.

Si una operación modifica varios registros que deben coincidir, usa una transacción y el **mismo EntityManager** para todas sus escrituras. No llames un repositorio que abre otra conexión fuera de la transacción esperando que participe en ella.

`DatabaseExceptionFilter` traduce violaciones de FK y unicidad a 409, cantidades inválidas o desbordamientos a 400 y evita filtrar SQL interno en respuestas. No suprimas restricciones de PostgreSQL para evitar esos errores.

## Inventario: invariantes obligatorias

1. `producto.cantidad >= 0` y es entero.
2. Debe coincidir con la suma de `ENTRADA` menos `SALIDA` del Kardex.
3. `ajuste_inventario` es auditoría; su cantidad no se vuelve a sumar aparte al saldo.
4. Las cantidades de movimientos y de líneas de carrito/pedido son positivas.
5. Una creación de producto con stock guarda producto, SKU definitivo, categorías y movimiento inicial atómicamente.
6. Un cambio manual guarda stock, auditoría y entrada/salida de referencia `AJUSTE` en una transacción. Las disminuciones requieren una salida real.
7. La escritura bloquea el producto `FOR UPDATE` y comprueba el saldo esperado antes de reemplazarlo.
8. Un cambio de metadatos sin cantidad debe preservar el stock vigente bajo el bloqueo; no sobrescribirlo con una lectura anterior.
9. Un fallo de Kardex o de auditoría revierte el cambio del producto.
10. No edites ni borres movimientos históricos para cuadrar saldos. Crea un movimiento compensatorio con motivo y referencia verificables.

La implementación compartida de ajustes está en `inventory/infrastructure/stock-transaction.ts`; los repositorios de producto e inventario la usan. Si introduces otra vía de modificar stock, aplica las mismas garantías o utiliza esos componentes.

Las altas de producto requieren proveedor, al menos una categoría y precio mayor que cero; la imagen es opcional. En edición, categorías se reemplazan dentro de la misma transacción que el producto. No vuelvas al flujo de crear primero y asignar categorías después. Preserva registros históricos sin esos datos; no fuerces cambios de datos para permitir desactivarlos. Las mutaciones de estado envían únicamente `isActive` para no sobrescribir cantidades concurrentes. Si falla una imagen opcional después de guardar el producto, informa ese resultado parcial y evita inducir una segunda creación.

`TipoMovimientoEnum.AJUSTE` existe para compatibilidad histórica y documentos de auditoría. Los nuevos movimientos con efecto en el saldo usan `ENTRADA` o `SALIDA`, con `TipoReferenciaEnum.AJUSTE` cuando corresponda.

Las entidades de Kardex, ajustes y detalles de compra viven en sus módulos canónicos. No recrees clases ORM duplicadas bajo `src/entities` que apunten a las mismas tablas.

Los módulos CRUD históricos `KardexModule`, `AjusteInventarioModule` y `CompraDetalleModule` conservados del remoto no están activos en `AppModule`. Activarlos exige adaptar autenticación, transacciones y efectos de stock. No los importes solamente para que aparezcan en Swagger.

## Checkout, dinero y numeración

- Una validación previa al checkout sirve para informar al cliente; no garantiza disponibilidad. Dentro de la transacción vuelve a leer carrito, líneas, precios y productos bloqueados.
- Bloquea productos en orden ascendente de ID para reducir interbloqueos.
- Agrupa cantidades por producto antes de comprobar stock: varias líneas del mismo producto no deben superar el saldo juntas.
- El checkout de un mismo carrito no debe generar dos pedidos aunque lleguen solicitudes simultáneas.
- El total se calcula en el servidor. Ignora importes enviados por clientes para decidir cuánto cobrar o registrar.
- Usa `cents`/`amount` de `src/shared/money.ts` en cálculos críticos. No compares importes de punto flotante con igualdad directa.
- El rango de persistencia es `numeric(14,2)` y la aritmética en centavos debe ser un entero seguro.
- `numero_pedido_usuario` es consecutivo por cliente, no una PK global. `pedido_id` es la PK.
- La asignación de números usa `pg_advisory_xact_lock(4970, clienteId)` dentro de la transacción. Respeta ese mismo bloqueo en cualquier otra vía de creación.
- El índice único `(cliente_id, numero_pedido_usuario)` es una defensa adicional; no sustituye el bloqueo.
- Pedido, detalles, pago pendiente, salidas, descuento de stock y retiro de líneas pertenecen a una transacción.
- Si falla una escritura posterior, no deben quedar un pedido parcial, stock descontado, ni carrito vaciado.
- Los pagos actuales son registros internos de estado. No describas la confirmación como liquidación bancaria automática.

## Modelo de datos y relaciones

Ver `docs/database-schema.md` para nombres físicos, tipos y nulabilidad. Revisa las entidades **y el esquema real** antes de una migración sobre una instalación existente.

| Tablas | Relaciones y propósito |
| --- | --- |
| `usuario`, `rol`, `usuario_rol` | Usuarios y asignación de roles mediante tabla intermedia |
| `cliente` | Perfil de cliente con relación única a usuario y documento único |
| `empleado` | Maestro de empleado; usuario opcional como referencia lógica sin FK declarada actualmente |
| `proveedor` | Proveedor con estado; relacionado con productos, direcciones y compras |
| `producto` | Proveedor opcional, SKU único, cantidad materializada, precio y estado |
| `producto_imagen` | Imágenes y `public_id` del servicio externo por producto |
| `categoria`, `categoria_producto` | Clasificación de productos mediante tabla intermedia |
| `direccion` | Puede pertenecer a cliente o proveedor; pedidos la referencian; tiene estado y bandera predeterminada |
| `carrito`, `carrito_detalle` | Carrito de usuario y líneas vinculadas a productos |
| `pedido`, `pedido_detalle` | Pedido de cliente/dirección y sus cantidades/precios persistidos |
| `pago` | Pagos internos asociados a pedido, método, monto y estado |
| `compra`, `compra_detalle` | Compras de proveedores registradas por usuario y sus líneas |
| `kardex` | Movimientos por producto; referencia polimórfica mediante tipo e ID |
| `ajuste_inventario` | Auditoría por producto y usuario, saldo anterior/nuevo, dirección, motivo y fecha |
| `media` | Contenido promocional independiente almacenado en Cloudinary |
| `migrations` | Historial técnico de TypeORM, ajeno a las 21 tablas de negocio |

Las referencias polimórficas del Kardex no son FKs a una sola tabla. No asumas que `referencia_id` siempre es un pedido. `tipo_referencia` define su interpretación.

Las instalaciones antiguas pueden tener `stock_anterior`, `stock_nuevo` y `tipo_cambio` nulos en auditoría. No inventes valores históricos sin evidencia ni endurezcas su nulabilidad sin una migración que preserve la información.

La columna `pedido.numero_pedido_usuario_legacy` conserva el número previo de pedidos reconciliados por la migración de adopción. No la borres al mapear/actualizar pedidos ni la uses para asignar nuevos números.

## Eliminaciones

- Productos, usuarios y proveedores se desactivan para conservar referencias.
- Una dirección usada por pedidos se desactiva; no se elimina físicamente ni se elimina el pedido para permitir borrarla.
- Las demás operaciones deben respetar las FKs y responder con un error de negocio útil si hay dependencias.
- No añadas `CASCADE` a pedidos, pagos, Kardex ni auditoría como arreglo rápido.
- No uses borrado de datos reales como preparación o limpieza de pruebas.

## Migraciones, respaldos y diagnóstico

1. Antes de alterar la DB del usuario, identifica contenedor y base por configuración/labels; no elijas solo por puerto.
2. Respalda con `pg_dump -Fc`; guarda el archivo en `.local/backups` o una ubicación privada autorizada.
3. Diseña migraciones explícitas, parametrizadas y revisables. Para esquemas existentes, inspecciona primero las columnas, enums, FKs, duplicados y valores nulos.
4. Prueba sobre una copia aislada. `pnpm test:upgrade` copia la DB y comprueba conservación de filas, conciliación e idempotencia.
5. `InitialSchema1794441600000` adopta las tablas existentes sin recrearlas. `HardenInventory1794441601000` aplica la evolución y conciliación preservando historial.
6. Una migración aplicada no se reescribe para introducir un cambio nuevo: añade otra con timestamp único y regístrala en la configuración. En el desarrollo de una migración aún no publicada, mantén consistentes pruebas y SQL inicial.
7. Usa el bloqueo de migraciones del CLI. No ejecutes dos comandos de cambio de esquema manuales en paralelo.
8. Ejecuta `pnpm db:check` al terminar y revisa migraciones pendientes, duplicados y diferencias de stock.
9. Regenera el modelo con `pnpm db:docs` cuando cambien entidades o relaciones.
10. No implementes un rollback que borre datos históricos. Si no existe una reversión segura, documenta restauración en una base separada.

TLS de PostgreSQL verifica certificados. No uses `rejectUnauthorized:false` como solución general. Para proveedores que usan CA propia, configura `DB_SSL_CA`.

## Frontend: reglas

- React 19/TypeScript 6, Vite 8 y React Compiler. Respeta las restricciones de hooks y evita optimizaciones manuales sin un caso concreto.
- Mantén funcionalidades en `src/modules/<feature>`, componentes compartidos en `shared` y composición/rutas en `pages`/`App.tsx` según corresponda.
- El frontend mezcla carpetas históricas con módulos por capas. Extiende el módulo apropiado antes de crear un directorio alternativo o duplicar una pantalla.
- Usa el alias `@/`; no incluyas dependencias del backend en el bundle ni imports que crucen entre paquetes.
- Usa la instancia `http` para solicitudes autenticadas. La instancia `refreshHttp` se reserva para auth y evita un ciclo de interceptores.
- React Query administra datos remotos. Zustand administra sesión/preferencias/estado local. No crees otra fuente de verdad del stock o de pedidos.
- Una mutación debe invalidar las query keys relevantes de catálogo, carrito, inventario, ajustes o dashboard. No muestres éxito antes de la respuesta del servidor.
- React Query 5 usa `placeholderData: keepPreviousData`; la opción antigua `keepPreviousData:true` no es válida.
- Mantén `strict`, `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`. Omite propiedades opcionales con spreads condicionales cuando no haya valor.
- Valida respuestas de error antes de convertirlas a una unión. No trates todo HTTP 409 como `STOCK_INSUFFICIENT`.
- Un refresh que devuelve `null` no es una sesión. Limpia el estado y permite iniciar sesión de nuevo; evita reintentos infinitos.
- Usa los componentes UI, tokens y patrones de tema existentes. Preserva accesibilidad, navegación por teclado, estados de carga, errores y diseño adaptable.
- React 19 permite `ref` como prop; declara correctamente `ComponentPropsWithRef` cuando un componente contenedor deba admitirlo.
- No guardes secretos bajo `VITE_`: esas variables son públicas en el bundle.
- No imprimas contenido de formularios, respuestas completas, datos de usuarios o tokens para depurar en producción.

## Medios y servicios externos

Cloudinary maneja imágenes/videos; Multer recibe archivos. Revisa tipo MIME, tamaño y contenido antes de subir. Conserva compensaciones: si la carga externa se completó y falla la persistencia, limpia el recurso recién creado sin borrar medios existentes de otros registros.

Las imágenes de producto admiten PNG/JPEG/WebP, máximo 5 MB: `validateProductImage` comprueba firma y MIME, y Multer limita el tamaño antes de cargar todo el archivo. Usa URLs HTTPS de Cloudinary. Al reemplazar una imagen o video, guarda primero la referencia nueva; solo después retira el recurso anterior. Un fallo de DB compensa únicamente el recurso nuevo. Los videos se eliminan con `resource_type: video`; no uses el tipo predeterminado image ni ocultes fallos del proveedor con logs de éxito. No registres objetos completos de error del SDK.

El alta pública de cliente y el alta administrativa de empleado guardan perfil/cuenta/roles en una transacción. No vuelvas a dividir esas escrituras entre repositorios con conexiones distintas: una unicidad fallida no debe dejar perfiles o cuentas huérfanos.

`GET /pedidos/me` recibe filtros validados de estado, fechas ISO sin hora y orden de una lista constante. Siempre conserva el cliente autenticado como condición; la fecha final incluye el día completo. La interfaz conserva los controles cuando el resultado queda vacío y ofrece limpiar filtros. Evita volver a filtrar fechas en el navegador sobre resultados ya filtrados por la DB.

React Hook Form expone estado mediante proxies. En Configuración, suscribe `isDirty` e `isValid` con `useFormState` y léelos sin cortocircuitos; se comprobó que el botón podía quedar deshabilitado con cambios válidos. `formatCOP` es la presentación compartida del catálogo/carrito/pedidos y conserva hasta dos decimales. Las listas de proveedores se invalidan tras alta/edición; no uses toggle como sustituto de una eliminación lógica idempotente.

Las pruebas aisladas no deben cargar archivos al Cloudinary real ni enviar correos o mensajes. Si un cambio requiere probar el servicio externo, delimita una cuenta/asset de prueba y registra qué se comprobó.

## Pruebas y controles

Para cambios en backend:

```powershell
cd backend
pnpm typecheck
pnpm lint
pnpm test --runInBand
pnpm test:integration
pnpm build
```

Si cambian esquema, movimientos o adopción de datos, añade `pnpm test:upgrade` y `pnpm db:check`. Para cambios en frontend:

```powershell
cd frontend
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm build
```

La integración crea una base `zero_inventory_test_*` por ejecución, necesita permiso `CREATEDB` y la elimina al terminar. El guard del test rechaza ejecutar sobre la DB del usuario. No relajes ese guard para resolver un error de configuración.

Pasa los argumentos de Jest directamente a pnpm: `pnpm test --runInBand`. No añadas otro separador `--` entre `test` y la opción: se comprobó que en Linux llega a Jest como un filtro de nombres y provoca `No tests found`, aunque en PowerShell la misma línea aparente funcionar.

Agrega pruebas que detecten el riesgo real: concurrencia de última unidad y mismo carrito, rollback a mitad de escritura, números únicos por cliente, disminución/incremento con Kardex, propiedad de dirección, números monetarios límite y cookies de producción. Evita pruebas que solo repliquen detalles internos sin comprobar una propiedad útil.

No afirmes que una prueba pasó si el comando quedó abierto o devolvió error. Distingue chequeo de tipos, build, pruebas unitarias, integración PostgreSQL y prueba de actualización. Una compilación exitosa no demuestra que las consultas funcionen en la DB real.

ESLint usa reglas de corrección; Prettier es un comando separado de formato. Evita reformatear cientos de archivos para una corrección localizada. No desactives reglas de tipos ni de seguridad para ocultar fallos.

## Documentación

- Actualiza `README.md` cuando cambien comandos, variables, roles, rutas públicas, servicios o requisitos.
- Actualiza este archivo cuando cambien las invariantes o la arquitectura operativa; conserva instrucciones concretas y verificables.
- Regenera `docs/database-schema.md` si cambian entidades; describe también restricciones SQL añadidas fuera de decoradores.
- Documenta la intención y los efectos sobre datos de cada migración. No describas correcciones contables históricas como si fueran reconstrucciones certificadas.
- Registra resultados y límites en `docs/validation.md` cuando una revisión importante lo justifique; no inventes porcentajes de cobertura.
- Los ejemplos deben contener placeholders, nunca secretos existentes. Los comandos deben funcionar desde el directorio indicado, especialmente en PowerShell.

## Git, integración y publicación

Usa ramas `codex/<descripcion>` salvo indicación explícita del usuario. Revisa el diff y la lista de archivos antes de preparar un commit. Nunca agregues `.env`, `.local`, `node_modules`, `dist` ni dumps.

`feature/products` y `origin/dev` divergieron históricamente. Un push directo de la primera a `dev` se rechazaba con `non-fast-forward`; los logs de DB son otro problema. No intentes solucionarlo eliminando filas o cambiando el esquema.

Antes de integrar, ejecuta `git fetch origin`, revisa ambas historias y resuelve conflictos conservando las funcionalidades requeridas. Los conflictos de entidades merecen una revisión especial: no dejes dos clases para la misma tabla ni pierdas columnas de auditoría.

Publica solamente cuando el usuario lo haya autorizado, y cumple las validaciones antes de subir. No hagas force push ni reescribas la historia compartida para evitar una divergencia. Comprueba que el hash remoto de `dev` coincide con el commit esperado después de publicar. Si una protección del repositorio exige PR, prepara el PR y comunica el bloqueo real; no eludas la política.

## Cierre de una tarea

Entrega el cambio concreto, sus pruebas y cualquier límite material. Para una corrección de operación, incluye comandos exactos y el directorio de ejecución. Reporta rama y commit cuando se haya hecho control de versiones. No declares todo funcionando si quedan pruebas fallidas, una migración pendiente o un push rechazado.

## Reportes y apariencia

- `ReportsModule` publica `GET /admin/reports` solo para ADMIN. Mantén controlador/caso de uso/puerto/adaptador separados y la transacción READ ONLY + REPEATABLE READ. Ejecuta sus consultas secuencialmente sobre el mismo manager. No mezcles joins de detalles/pagos para sumar pedidos.
- Fechas inclusivas válidas y máximo 366 días. Pedidos usan `fecha`, pagos `fecha_pago`; inventario es actual e independiente del rango. Las sumas admiten más que una fila numeric(14,2), conservando centavos enteros seguros; no reutilices el límite monetario de escritura para agregados.
- CSV exporta el período aplicado y protege nombres/SKU contra fórmulas, incluyendo prefijos con espacios. Conserva BOM UTF-8, escapes y pruebas con `pnpm test:unit`. No exportes perfiles personales.
- La preferencia de apariencia vive en el servidor y `ThemeSync` la restaura por usuario; React Query incluye usuario en claves de configuración. Conserva claro/oscuro y color-scheme nativo. El CSS carga el config Tailwind y define dark por clase. Usa tokens semánticos para superficies, texto, bordes y etiquetas; reserva blanco fijo para botones de fondo sólido o las pantallas de marca explícitamente oscuras.
- El catálogo prioriza disponibilidad solo en el orden predeterminado. Nombre/stock ascendente o descendente deben incluir agotados en su posición correcta. No vuelvas a ordenar por disponibilidad antes de un criterio explícito.
- Desactivar un medio lo oculta de listados y lectura pública por ID; el administrador conserva la gestión en `/media/admin/all`. La desactivación de la aplicación no revoca por sí sola una URL previamente conocida del CDN.
