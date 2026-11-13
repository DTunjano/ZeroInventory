# Usuarios, roles y reglas de catálogo del MVP

Decisión del usuario, 12 de noviembre de 2026: completar usuarios/roles; aplazar reportes avanzados; imagen de producto opcional; proveedor, al menos una categoría y precio mayor que cero obligatorios en altas.

## Gestión de cuentas

La pantalla `/admin/users` está disponible en el menú **Usuarios y roles**, únicamente para `ADMIN`. El módulo frontend vive en `src/modules/users`, con contrato de repositorio, adaptador HTTP, casos de uso y presentación; `pages/admin` conserva la composición de la ruta.

Permite buscar por nombre de usuario, filtrar cuentas activas/inactivas, paginar, crear, editar, asignar uno o varios roles y desactivar/reactivar. No hay borrado físico desde la pantalla. Los roles son los tres valores fijos `ADMIN`, `EMPLOYEE`, `CUSTOMER`; esta entrega administra sus asignaciones, no crea tipos nuevos de permisos.

| HTTP | Operación | Reglas |
| --- | --- | --- |
| `GET /usuarios` | Listado paginado | `username`, `isActive=true/false`, `page` entero >=1 y `limit` entero 1–100 |
| `GET /usuarios/:id` | Detalle | ID entero; 404 si no existe |
| `POST /usuarios` | Crear cuenta y roles | `username`, `password`, `roles` no vacíos; contacto/nombres opcionales |
| `PUT /usuarios/:id` | Editar cuenta y/o reemplazar roles | Solo actualiza campos enviados; contraseña omitida conserva el hash; `roles` enviado reemplaza el conjunto y no admite vacío |
| `DELETE /usuarios/:id` | Desactivar | Conserva referencias e historial; no elimina la fila |

Todas estas rutas requieren `ADMIN`. Sus respuestas contienen roles y datos públicos de la cuenta; nunca contraseña ni hash. Swagger usa DTOs de respuesta separados de los de entrada. Las contraseñas nuevas o cambiadas se guardan con bcrypt.

Crear/asignar `CUSTOMER` requiere un perfil `cliente`. Si no existe, `documento` es obligatorio y se crea el perfil en la misma transacción, con tipo `CC`. Si ya existe, se conserva: el campo no cambia documentos históricos. Un documento duplicado devuelve 409 y revierte la cuenta y sus asignaciones. Retirar CUSTOMER no borra el perfil, direcciones ni pedidos existentes.

Asignar `EMPLOYEE` habilita permisos de empleado; la ficha laboral se administra en **Empleados**. El estado de la cuenta y la ficha laboral son conceptos distintos. Las acciones de estado desde Empleados sincronizan ambos registros atómicamente, incluida la ruta explícita de desactivación.

## Garantías de acceso

- Cada solicitud autenticada valida en PostgreSQL el estado vigente y los roles de la cuenta; no confía en roles antiguos del JWT. Desactivar una cuenta invalida su acceso a las rutas protegidas; cambiar roles modifica la autorización de las solicitudes siguientes.
- Cambios de cuenta/asignaciones usan el bloqueo transaccional `pg_advisory_xact_lock(4971, 0)`. Los endpoints históricos de asignaciones usan el mismo bloqueo y evitan duplicados.
- No se permite retirar o desactivar al último administrador activo. Se comprueba dentro de la transacción y un conflicto revierte todas las escrituras. Las acciones de estado del empleado aplican la misma regla a su cuenta vinculada.
- El catálogo de roles no admite renombrar o eliminar sus valores del sistema. La UI no publica acciones de modificación del catálogo.
- Esto **no añade revocación persistente de tokens ni sesiones por dispositivo**. Un logout o un cambio de contraseña no debe describirse como cierre de todas las sesiones. La comprobación actual impide usar una cuenta inactiva y verifica sus roles actuales; no registra sesiones individuales revocadas.

## Productos

`POST /productos` exige `nombre`, `cantidad` entera >=0, `proveedorId` entero positivo, `categoriaIds` no vacío y sin repetidos, y `precio` entre 0.01 y 999999999999.99, con máximo dos decimales. La imagen es opcional y se carga por su endpoint de medios cuando se elige un archivo.

Ejemplo de cuerpo con IDs de prueba que deben sustituirse por referencias existentes:

```json
{
  "nombre": "Producto de demostración",
  "cantidad": 5,
  "precio": 15000,
  "proveedorId": 1,
  "categoriaIds": [1]
}
```

Producto, SKU definitivo, categorías y movimiento inicial se guardan en una transacción. Editar con `categoriaIds` reemplaza sus relaciones dentro de la transacción del producto: si una categoría no existe, se revierten también stock, Kardex y auditoría de ese cambio. El frontend ya no crea el producto para después asignar categorías mediante varias peticiones independientes.

En `PUT /productos/:id`, los campos omitidos se conservan. `proveedorId` enviado no admite null; `categoriaIds` enviado requiere al menos una categoría válida; un precio enviado debe ser mayor que cero. Las altas nuevas siguen la política aprobada; no se reescribieron los productos históricos que carecen de proveedor/categoría o tienen precio cero. Cambiar solo el estado envía únicamente `isActive` para preservar el stock actual y permitir desactivar registros históricos.

Si se guarda el producto y falla la carga opcional posterior de una imagen, la interfaz informa que el producto quedó guardado y que la imagen puede cargarse al editar. No presenta esa situación como una creación fallida que deba repetirse. Se validó la carga real de un PNG ficticio de 32×32 autorizado, vinculado solo a la DB temporal. Se verificó su renderizado y después se retiró el recurso con autorización expresa. No se cargaron videos reales.

## Reportes y estado de la etapa

Inicialmente los reportes avanzados se excluyeron por decisión del usuario. Una petición posterior de completar los pendientes incorporó REP-01 al cierre: ahora existe el módulo administrativo de reportes operativos, de solo lectura y con CSV. Sus definiciones y límites están en [reportes.md](reportes.md).

Esta decisión cierra el acuerdo de alcance de usuarios/reportes y catálogo, no la etapa 1 completa. Su matriz y casos pendientes continúan en [revision-funcional-mvp.md](revision-funcional-mvp.md). La etapa 2 y la pasarela siguen sin iniciarse.

## Ampliación de validación y medios

- El registro público de cliente y el alta de empleado usan una transacción para perfil/cuenta/roles. Conflictos de documento o cuenta no dejan registros parciales; hay pruebas de concurrencia y rollback.
- `GET /pedidos/me` acepta `estado`, `dateFrom`, `dateTo`, `sortBy` (`fecha_desc`, `fecha_asc`, `total_desc`, `total_asc`). Las fechas tienen formato `YYYY-MM-DD`; la final incluye todo el día. El cliente autenticado siempre limita la consulta. Una fecha invertida o un valor fuera de las listas admitidas devuelve 400. Los controles siguen visibles sin resultados y permiten limpiar filtros.
- Las imágenes de producto aceptan PNG/JPEG/WebP de hasta 5 MB, con firma/MIME comprobados y límite Multer. La imagen nueva se persiste antes de retirar la anterior; al fallar la DB se limpia solo el recurso recién creado. Para videos se comprueba firma MP4/WebM y se retiran con el tipo de recurso video.
- La vista de proveedores refresca sus datos al guardar y consulta su trazabilidad. Eliminar lógicamente asigna `isActive: false`, incluso si ya estaba inactivo; no alterna el estado.
- El formato COP compartido muestra los centavos admitidos por el servidor, en vez de redondearlos visualmente a cero. Configuración usa una suscripción explícita al estado del formulario para habilitar guardar con cambios válidos.
- Los recorridos de registro, direcciones, carrito, pedidos, proveedores, empleados, perfil y auditoría están documentados en la matriz. Video real autorizado, modo claro, ordenamiento y reportes ya se validaron; contraseña desde UI completada personalmente por el usuario y verificada después. Solo resta aceptación final para cerrar etapa 1.
