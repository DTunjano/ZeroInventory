# Reportes operativos — REP-01

La petición de completar los pendientes de la etapa 1 amplió el alcance anterior e incorporó reportes. Es una consulta administrativa de solo lectura; no cambia estados de pedidos, pagos ni inventario y no integra una pasarela.

## Acceso y arquitectura

- Pantalla `/admin/reports`, menú Reportes, exclusiva de `ADMIN`.
- API `GET /admin/reports?dateFrom=2026-11-01&dateTo=2026-11-12` con JWT de acceso. Sin sesión devuelve 401; cliente y empleado reciben 403.
- Backend `src/reports`: controlador → caso de uso → contrato de repositorio → adaptador TypeORM. El dominio contiene los tipos del resultado y el puerto; no importa ORM.
- Frontend `src/modules/reports`: modelos, contrato, casos de uso, adaptador HTTP y presentación. React Query usa usuario y período en la clave; la exportación usa la misma respuesta aplicada, no las fechas todavía sin consultar.
- Cada respuesta se obtiene dentro de una transacción `REPEATABLE READ`, `READ ONLY`, con consultas secuenciales sobre el mismo manager. No se agregan tablas ni migraciones.

## Períodos y significado de las cifras

Las fechas tienen formato `YYYY-MM-DD`, deben existir y formar un rango inclusivo de 1 a 366 días. Por defecto se consulta del primer día del mes hasta hoy en `America/Bogota`. SQL compara las fechas calendario almacenadas en la DB e incluye todo el último día con un límite superior exclusivo. No se reconstruye la zona horaria de registros históricos.

| Resultado | Definición |
| --- | --- |
| Pedidos registrados / total | Cantidad y suma de `pedido.total` según `pedido.fecha`, incluyendo todos los estados. No representan ingresos cobrados |
| Pedidos por día / estado | Agrupación de esos mismos pedidos, sin multiplicarlos por líneas o pagos |
| Pagos aprobados / pendientes | Suma de `pago.monto` por estado `APROBADO` / `PENDIENTE`, según `pago.fecha_pago`; cada registro de pago cuenta individualmente |
| Pagos por método | Solo aprobados, agrupados por método. Son registros internos, sin certificación bancaria |
| Productos más pedidos | Hasta 10 productos por unidades, desempate por ID; pedidos `CONFIRMADO`, `COMPLETADO` o `ENVIADO`. Excluye cancelados y devueltos. Suma el subtotal persistido de sus líneas |
| Inventario actual | Productos activos y sus unidades; independiente del período consultado |
| Stock bajo / agotado | Hasta 10 productos activos con cantidad <= 5, ordenados por cantidad e ID. Es un indicador del reporte, no cambia los umbrales históricos del módulo Inventario |

Pedidos y pagos se agregan en consultas independientes para evitar duplicaciones por joins. Un período vacío devuelve ceros y listas vacías; el inventario actual sigue disponible. Los importes de una suma pueden superar el límite de una sola fila `numeric(14,2)`; su conversión valida centavos enteros seguros y rechaza un total irrepresentable indicando que debe reducirse el período.

## Exportación CSV

El botón Exportar CSV descarga todos los bloques de la consulta aplicada y el inventario actual mostrado. Se deshabilita durante carga/error. El archivo contiene BOM UTF-8, separador `;`, líneas CRLF y celdas entre comillas con escape de comillas internas. Los importes numéricos se exportan sin símbolo ni separadores de miles y con punto decimal.

Los nombres/SKU no confiables que comienzan por indicadores de fórmula, incluso precedidos por espacios, reciben un apóstrofo para evitar fórmulas al abrirlos en una hoja de cálculo. No se exportan contraseñas, usuarios, direcciones ni datos personales de compradores. No es una factura ni un reporte contable certificado.

## Validaciones

`backend: pnpm test:integration` comprueba autorización, fechas inexistentes, rangos invertidos/excesivos, parámetros desconocidos, suma de un pedido con varias líneas/pagos y período sin registros. Las unitarias comprueban sumas monetarias grandes y rechazo de valores inseguros. `frontend: pnpm test:unit` comprueba CSV y orden del catálogo.

El navegador verificó 2 pedidos ficticios por $31.000, $19.000 aprobados, $12.000 pendientes, exportación descargada con esos valores, período vacío y error por rango excesivo. Se revisaron temas claro/oscuro y vista móvil de 390 px. Evidencia privada en `.local/functional-evidence/reports-*-validated.jpg`.
