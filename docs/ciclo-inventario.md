# Etapa 2 — Compras, recepción e inventario

Fecha de las decisiones: 13 de noviembre de 2026. Rama: `codex/inventory-lifecycle`. Estado: implementación y validación; aceptación final pendiente. Etapa 1 cerrada, aceptada y publicada en `dev`. Etapa 3 y pasarela sin iniciar.

## Reglas aprobadas

El usuario eligió **borrador → confirmar recepción** y **recepción completa por compra**. Guardar o editar borradores no modifica stock. Confirmar registra la totalidad de las líneas una sola vez; no se admiten cantidades parciales enviadas al confirmar.

Se conservaron los roles operativos existentes: ADMIN y EMPLOYEE pueden consultar, crear, editar y recibir; solo ADMIN cancela borradores. CUSTOMER carece de acceso. El actor se obtiene de la sesión y el total se calcula en el servidor. No se envía dinero a proveedores ni se generan facturas fiscales.

## Flujo y API

Pantalla `/admin/purchases`, menú **Compras**. Tiene filtro por estado, paginación, detalle, editor de líneas, confirmación de recepción, cancelación con motivo e historial de cada versión. El editor permite buscar y paginar proveedores/productos activos y restringe productos al proveedor elegido. Admite de 1 a 100 productos distintos; cantidades enteras positivas y costos positivos con dos decimales como máximo.

| Operación | Endpoint | Efecto |
| --- | --- | --- |
| Crear borrador | `POST /compras` | Cabecera, líneas e historial CREADA en una transacción; sin cambio de stock |
| Listar | `GET /compras` | Filtros `estado`, `proveedorId`, `usuarioId`, `page`, `limit`; límite máximo 100 |
| Ver detalle | `GET /compras/:id` | Cabecera, líneas e historial en un snapshot de lectura consistente |
| Editar borrador | `PUT /compras/:id` | Reemplazo de líneas, total calculado y evento ACTUALIZADA; requiere versión vigente |
| Recibir completo | `POST /compras/:id/receive` | Requiere `version`; stock, entradas, estado y evento RECIBIDA atómicos |
| Cancelar borrador | `PATCH /compras/:id/cancel` | ADMIN, `version` y `motivo`; conserva líneas e historial; sin cambiar stock |
| Borrar compra | `DELETE /compras/:id` | Retirado: 410; no elimina documentos |
| Consultar Kardex | `GET /inventory/products/:productoId/movements` | ADMIN/EMPLOYEE, `page`/`limit`; movimientos, stock actual y saldo en un mismo snapshot de solo lectura |
| Escritura suelta de Kardex | `POST /inventory/kardex/movements` | Retirada: 410; usar recepción o ajuste auditado |

Ejemplo de borrador, con IDs existentes de un mismo proveedor:

```json
{
  "proveedorId": 1,
  "observaciones": "Pedido interno de reposición",
  "lineas": [{ "productoId": 1, "cantidad": 3, "costoUnitario": 10.15 }]
}
```

El servidor rechaza `usuarioId`, `total`, subtotales y propiedades no declaradas en el cuerpo. Para editar se envía la misma estructura más `version`. Para recibir: `{ "version": 1 }`. Una versión desactualizada de un borrador devuelve 409. Repetir una recepción ya completada devuelve 200 con el documento original sin sumar unidades, actualizar su fecha ni añadir otro evento.

## Integridad y concurrencia

- Cada cambio de compra bloquea su cabecera `FOR UPDATE`. La versión impide sobrescribir ediciones concurrentes.
- Se vuelve a validar proveedor/productos activos y pertenencia al proveedor al recibir. Los productos se bloquean en orden ascendente de ID, compatible con checkout.
- Se recalculan líneas y total persistidos antes de recibir. Todas las escrituras usan el mismo EntityManager.
- Una entrada ENTRADA por producto, referencia `RECEPCION_COMPRA` y `referencia_id=compra_id`. La referencia distinta evita confundir compras recibidas con antiguas entradas COMPRA/AJUSTE de altas y adopción.
- Stock, Kardex, cabecera recibida y evento se confirman juntos. Fallar en un movimiento posterior o en el evento final revierte las líneas ya procesadas.
- Una compra recibida no admite edición ni cancelación. Las correcciones de cantidades se registran como ajustes compensatorios con motivo verificable, conservando la compra.
- Los ajustes manuales mantienen actor, saldo esperado, auditoría y movimiento firmado. Se calculan importes en centavos y se rechaza un total fuera de rango antes de guardar.
- La recepción utiliza el costo de compra persistido; no cambia el precio de venta. La valoración de los ajustes conserva la regla previa basada en precio del producto; no se implementa costo promedio contable.
- El Kardex de consulta está disponible desde **Inventario → Ver movimientos**, conserva productos inactivos e incluye enlace a la compra cuando la referencia es RECEPCION_COMPRA. Los registros históricos AJUSTE no se vuelven a sumar al saldo.

**Inventario → Ajustar stock** exige saldo nuevo y motivo, muestra entrada/salida y conserva la propuesta cuando el servidor rechaza un saldo esperado desactualizado. **Actualizar saldo y reiniciar cantidad** recupera el saldo vigente, reinicia la cantidad y conserva el motivo; el operador revisa antes de enviar de nuevo. En Productos, editar metadatos muestra stock de solo lectura y omite cantidad al guardar. Las altas conservan su entrada inicial atómica.

Proveedores muestra únicamente unidades de compras RECIBIDA, por el proveedor original de su cabecera. Borradores, canceladas, stock inicial y ajustes no se cuentan como entregas. Cambiar después el proveedor del producto no reasigna compras anteriores.

## Historial, fechas y migraciones

`compra_evento` conserva actor, acción, fecha, versión y snapshot del proveedor/productos/cantidades/costos de cada cambio. Tiene FKs sin cascada y unicidad `(compra_id, version)`. Las líneas de un borrador pueden reemplazarse; sus versiones anteriores permanecen en snapshots. Nombres/SKU de las líneas del detalle reflejan los maestros actuales; los snapshots conservan los nombres registrados en cada evento.

`PurchaseLifecycle1794528000000` añade estados BORRADOR/RECIBIDA/CANCELADA/LEGACY, versión, observaciones, actor/fecha de recepción y cancelación, restricciones de coherencia, historial e índice de consulta. Las cabeceras anteriores se adoptan como LEGACY, de solo lectura: no se reconstruyen eventos ni se suman movimientos. Se mantienen intactas las cantidades, importes y referencias históricas.

La revisión detectó que los timestamps sin zona producían una diferencia de cinco horas entre creación y recepción. `PurchaseTimestamps1794528001000` añade `compra.registrada_en` y `kardex.registrado_en` como timestamptz y normaliza los nuevos campos de recepción/cancelación y eventos antes de publicar el ciclo. No modifica `fecha_compra` ni `fecha_movimiento` históricos. Un guard rechaza convertir operaciones guardadas con la versión intermedia de desarrollo; si existieran, exige una conversión explícita que conserve sus fechas, sin borrar filas. La DB habitual no tenía esas operaciones; las pruebas intermedias usaron DB desechable.

Las nuevas escrituras usan instantes del servidor; la interfaz los presenta en America/Bogota. Para registros antiguos sin instante nuevo se conserva la interpretación previa, sin certificar su zona histórica. No hay rollback destructivo de estas migraciones: restaurar un respaldo en una base separada.

`InventoryAuditInstant1794528002000` añade `ajuste_inventario.registrado_en` nullable, sin alterar la fecha antigua. Los ajustes nuevos escriben ese instante en la misma transacción. Auditoría filtra días inclusivos en America/Bogota y valida fechas reales/rangos ordenados; acepta fecha ISO o un instante ISO convertido a ese calendario. Dashboard utiliza el instante nuevo del Kardex para actividad y mes, conservando el fallback de registros anteriores. Las tres migraciones están aplicadas en la instalación habitual, con respaldo previo y prueba de copia.

Se inspeccionaron esquema y conteos sin datos personales. Antes de migrar la instalación habitual se guardó y verificó un pg_dump custom privado en `.local/backups`, confirmando labels del contenedor postgres-zero-inventory/zeroinventory/db. La actualización se probó primero sobre copia aislada; no se eliminaron datos habituales ni medios externos.

## Validación y aceptación

Validación técnica del 14/11/2026: tipos, lint y build de ambos paquetes correctos; 33 pruebas unitarias backend, 54 de integración HTTP/PostgreSQL y 7 unitarias frontend. La suite integra regresiones de checkout existentes; ejecutarlas no inicia la implementación de la etapa 3. Actualización de copia: 22 tablas conservadas, conciliación e idempotencia. Diagnóstico habitual y de QA sin migraciones pendientes ni inconsistencias de stock, numeración, totales, recepción o eventos. El último respaldo custom verificado tiene 83.359 bytes y permanece privado.

| Caso | Resultado y evidencia |
| --- | --- |
| COM-01 Crear/editar borrador | API y UI: sin stock, total del servidor, dos líneas, versión e historial; edición de compra ficticia a $61,30 |
| COM-02 Recibir completo | API y UI ADMIN/EMPLOYEE: suma todas las líneas, entradas con referencia y actores correctos; recibidas sin edición/cancelación |
| COM-03 Reintento y concurrencia | Integración PostgreSQL: dos recepciones simultáneas producen un solo efecto; edición vs recepción y versión obsoleta controladas |
| COM-04 Rollback | Integración: fallos provocados de segunda entrada o evento final revierten stock, Kardex y cabecera; triggers exclusivos de DB temporal |
| COM-05 Cancelar borrador | API y UI ADMIN: motivo obligatorio, conserva líneas/historial; EMPLOYEE rechazado por API y sin botón en UI |
| COM-06 Referencias y entradas | Integración: proveedor/productos activos del mismo proveedor, duplicados y datos manipulados rechazados; actor/total del cliente rechazados |
| COM-07 Históricos | Integración y copia de actualización: LEGACY sin recepción inventada, no editable; referencias antiguas preservadas. La instalación habitual no tenía cabeceras de compra previas |
| COM-08 Listado y permisos | API y UI: filtros, vacío, paginación de 11 documentos, enlace directo conservado al recargar; CUSTOMER redirigido y API 403 |
| INV-01 Kardex de lectura | API y UI: saldo igual a stock, referencia navegable a compra y dos páginas con saldo 11; Escape cierra el diálogo. Lectura de productos inactivos cubierta por integración |
| INV-02 Ajustes y conflicto | API y UI: baja 16→12, rechazo previo de saldo obsoleto sin perder campos, actualización/reintento; baja posterior 12→11 con motivo/actor/fecha; sin motivo no se habilita envío |
| INV-03 Metadatos | UI y regresiones existentes: descripción editada conservando stock 11; campo cantidad de solo lectura y omitido al actualizar |
| INV-04 Proveedor | API y UI: 9 unidades recibidas; borradores/cancelación/ajustes excluidos; integración conserva atribución al cambiar proveedor de producto |
| FEC-01 Fechas | API: límite de medianoche Bogotá, inválidas/rango invertido y dashboard con instante distinto de fecha antigua; UI: rango 14/11 devuelve los 13 ajustes de ese día y excluye los tres anteriores; Kardex/recepción con hora consistente |
| AUD-01 Paginación | API: tres páginas de una fila sin duplicados; UI: 16 ajustes distribuidos en 15 filas + 1 fila, con navegación correcta |
| UI-01 Presentación | Compras y ajustes en móvil 390 px, temas claro/oscuro y escritorio; tablas desplazan internamente; etiquetas de auditoría corregidas para contraste en claro |

Capturas locales privadas en `.local/functional-evidence`: `phase2-receipt-desktop-dark.png`, `phase2-kardex-receipt-validated.png`, `phase2-purchases-mobile-light.png`, `phase2-stale-stock-rejected.png`, `phase2-adjustment-kardex-mobile.png`, `phase2-employee-receipt-mobile-dark.png` y `phase2-audit-instant-light.png`. No se publican cuentas ficticias ni capturas en Git. La evidencia API de concurrencia, rollback y LEGACY no se presenta como una prueba manual del navegador.

La etapa 2 permanece abierta hasta recibir aceptación del usuario sobre la entrega verificada; la aprobación de las dos reglas iniciales no equivale a aceptación de la implementación. No se ha añadido pasarela ni comenzado la etapa 3.
