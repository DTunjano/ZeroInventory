# Diagnóstico comprobado — 12 de noviembre de 2026

## Rechazo de Git

La rama local de trabajo original era `feature/products`, commit `d5c666e`. `origin/dev` apuntaba a `008b80e`; las dos ramas habían avanzado desde un ancestro común. La rama `dev` local también estaba atrasada respecto a su remoto.

Se ejecutó `git push --dry-run origin feature/products:dev`, sin publicar cambios. El remoto rechazó la operación con `non-fast-forward`. Esto reproduce un impedimento concreto para subir el trabajo original a `dev`. El reflog conserva además un intento anterior de rebase que luego fue revertido. No se dispone de la salida completa del push histórico para afirmar que este fuera su único error.

Se integró el remoto dentro de `codex/fix-inventory-consistency`. Hubo conflictos en `app.module.ts` y entidades de producto/ajustes. Se conservaron las funcionalidades de la rama de trabajo y las entidades de los módulos remotos, unificando imports. Los CRUD históricos que eluden la escritura transaccional de inventario permanecen sin registrar en la aplicación activa.

No se encontró un hook del repositorio que vincule el push a la DB. Publicar código y migrar la DB son operaciones independientes. La solución al rechazo conserva las dos historias y no requiere forzar el remoto.

## Contenedor identificado

Docker confirmó el contenedor `postgres-zero-inventory`, imagen `postgres:18.0`, activo en `5432`. Sus labels indicaban proyecto Compose `zeroinventory`, servicio `db` y este directorio de proyecto. `pgadmin-zero-inventory` estaba activo en `8082`.

Los otros PostgreSQL presentes pertenecen a proyectos distintos. No se utilizaron para ejecutar pruebas ni se borraron sus datos.

## Errores históricos reales de PostgreSQL

Los logs guardados en el contenedor incluían:

| Evidencia | Causa y resolución |
| --- | --- |
| `ALTER TABLE producto ADD proveedor_id integer NOT NULL` con registros nulos | El arranque con sincronización intentaba imponer un campo obligatorio a datos existentes. Proveedor sigue siendo opcional; se desactivó `synchronize` y se usan migraciones explícitas. |
| `ALTER TABLE ajuste_inventario ADD stock_anterior integer NOT NULL` | Había auditoría antigua sin esos valores. Se conservó su nulabilidad y se evita reconstruir columnas al arrancar. |
| Intentos de añadir `tipo_movimiento` y errores por nulos | Diferencias entre entidades, esquema y correcciones manuales. Se mantiene una entidad canónica y la migración rellena el tipo histórico faltante con `AJUSTE`, preservando los registros. |
| `numeric field overflow` al insertar `pedido.total` | `numeric(10,2)` no admitía esos totales. Se amplió la cadena monetaria a `numeric(14,2)` y se calculan totales críticos en centavos con validación de rango. |
| Borrado de `direccion` rechazado por FK de `pedido` | Los pedidos deben conservar su dirección. La eliminación de una dirección utilizada la desactiva; el checkout rechaza direcciones inactivas. |
| Asignación de rol rechazada por FK | No existía el rol referenciado. La migración asegura los roles base y las operaciones mantienen las FKs. |

Las repeticiones de estos mensajes explican el arranque con múltiples errores, pero no son mensajes de Git. No se resolvieron eliminando tablas o anulando restricciones.

## Datos descubiertos al probar la migración

La primera prueba sobre una copia de la DB falló al crear el índice único de numeración por cliente. Se encontraron grupos de 17, 7 y 2 pedidos con número `0` repetido. No había productos con stock negativo ni líneas de pedido con cantidad no positiva en esa revisión.

La migración reconcilia los números cero o duplicados usando números libres superiores al máximo de cada cliente y conserva el valor anterior en `numero_pedido_usuario_legacy`. No cambia `pedido_id`, no borra pedidos y no altera las FKs de detalles o pagos.

Los saldos de productos y movimientos históricos tampoco se borran. Se agregan movimientos compensatorios de referencia `AJUSTE` donde haga falta para adoptar el saldo materializado existente. Esto hace coherentes los saldos actuales y conserva la evidencia anterior; no certifica el costo contable de operaciones históricas.

La prueba de actualización, ya corregida, confirmó que las 21 tablas de negocio conservaron su número de filas, que el Kardex quedó conciliado y que una segunda ejecución no aplicó cambios. Posteriormente se aplicaron las migraciones a la DB del proyecto con respaldo previo y `db:check` confirmó ausencia de pendientes, diferencias de stock y números duplicados.

## Hallazgos de código corregidos

- Creación/ajuste de producto, saldo y trazabilidad participan en una transacción, con bloqueo de filas y sin ocultar errores de auditoría.
- Las reducciones manuales generan una salida de Kardex.
- Checkout revalida disponibilidad dentro de la transacción y serializa la numeración por cliente.
- Un envío concurrente del mismo carrito no genera dos compras.
- Producto, proveedor y usuario se desactivan para preservar referencias.
- Cookie segura en producción, CORS por entorno, TLS con verificación de certificado y validación de configuración.
- Guard de API global y control de propiedad de las direcciones.
- Los scripts de diagnóstico usan la configuración compartida; se retiraron credenciales de conexión escritas en el código de esos scripts.
- Mappers de entidades nuevas omiten PKs marcador de valor cero.
- El frontend diferencia errores de stock de otros conflictos y valida una sesión nula al renovar.
- Se corrigieron errores de tipos, referencias inexistentes de vistas, refs de contenedores y API antigua de React Query.
- ESLint del frontend ahora incluye TypeScript; el build también comprueba tipos.

## Corrección al análisis inicial

El análisis inicial solo había examinado el `.env` raíz, que contenía nombres JWT antiguos. `backend/.env` sí contenía las variables de acceso y renovación correctas. No era evidencia de secretos faltantes. La revisión operativa comprobó ambos archivos, mantuvo su precedencia y agregó plantillas y validación para evitar ambigüedad en otras instalaciones.

## Datos y secretos

El respaldo previo está en `.local/backups/zero-inventory-before-fixes.dump` y se excluye de Git. Los archivos de entorno también se excluyen. No se incluyen contraseñas, tokens, datos de clientes ni contenido del dump en este diagnóstico. Las credenciales de volúmenes ya inicializados deben administrarse en su servicio; editar una variable de inicialización no cambia una contraseña persistida.

Se rotó la contraseña débil de PostgreSQL, que aparecía en scripts históricos, mediante una operación transaccional del rol y una actualización coordinada de los archivos de entorno. Se conservó el usuario de conexión y la DB. También se respaldó la configuración SQLite de pgAdmin en `.local/backups/pgadmin-before-fixes.db` y se actualizó explícitamente su contraseña de administrador. El acceso web con el secreto generado se verificó mediante un login válido con CSRF. Las contraseñas actuales solo están en `.env`; las conexiones de pgAdmin que guardaron la contraseña anterior pueden requerir ingresarla de nuevo.
