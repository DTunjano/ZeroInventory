# Etapa 2 — Ciclo del inventario

Estado: iniciada después del cierre aceptado y publicado de la etapa 1. Rama de trabajo `codex/inventory-lifecycle`. La pasarela y las transiciones de pedidos de la etapa 3 permanecen fuera de este trabajo.

## Punto de partida comprobado

La revisión de solo lectura del esquema habitual encontró `compra` (cabecera con proveedor, usuario, total y fecha) y `compra_detalle` (producto, cantidad, costo y subtotal), con FKs que preservan sus referencias. No existen columnas de estado o recepción. Los conteos fueron cero compras y cero líneas, con dos movimientos históricos de referencia `COMPRA`. No se borrarán ni reinterpretarán esos movimientos: algunas entradas iniciales de producto utilizan esa referencia histórica.

El CRUD activo de Compras guarda cabeceras sin coordinar líneas ni recepción y acepta usuario/total desde el cuerpo. El CRUD histórico de detalles sigue inactivo. No se activará como vía independiente de cambiar cantidades; la recepción debe coordinar todas las escrituras con el mismo manager.

Los ajustes manuales ya usan bloqueo de producto, saldo esperado, auditoría y Kardex en una transacción. Se añadió cálculo en centavos antes de persistir para rechazar valoraciones que excedan el rango sin dejar auditoría o saldo parcial. Las regresiones nuevas cubren también dos ajustes concurrentes para un mismo saldo esperado.

## Decisiones solicitadas al responsable

1. Borrador sin efecto en stock y confirmación posterior de recepción (propuesto), o registro y recepción juntos.
2. Recepción completa por compra (propuesta), o recepciones parciales con historial.

Estas decisiones están pendientes. No se ha creado todavía una migración ni implementado un estado de recepción que suponga su respuesta.

## Garantías requeridas para la implementación

- Identidad del actor tomada de la sesión; totales calculados en servidor desde líneas válidas, con cantidades enteras positivas y dinero en centavos.
- Compra/líneas/recepción/movimientos/saldo consistentes, con transacción única y productos bloqueados en orden de ID.
- Confirmaciones repetidas o concurrentes no pueden sumar stock dos veces.
- Fallos de una línea, de Kardex o de la escritura final revierten toda la operación.
- Bajas manuales a través de ajuste con motivo, saldo esperado, actor y salida efectiva; sin editar movimientos históricos.
- Revisar la vía genérica `POST /inventory/kardex/movements`: hoy permite referencias arbitrarias y no crea auditoría de ajuste. La nueva recepción no debe depender de una llamada que abra otra transacción ni permitir eludir su control de duplicados.
- Preservar registros históricos y tratarlos explícitamente al adoptar el ciclo nuevo. Una referencia polimórfica histórica no demuestra que exista una cabecera de compra.
- Probar cambios de esquema sobre copia aislada, con respaldo antes de migrar la DB habitual. Regenerar modelo y documentación; mantener las dos consolas de desarrollo.

## Cierre de la etapa

Pendientes: decisiones de recepción, implementación API e interfaz, migración revisada si corresponde, pruebas de permisos/concurrencia/rollback/duplicados, validación móvil y escritorio, copia de actualización, diagnóstico y aceptación del responsable. No se declara cerrada esta etapa por haber iniciado la revisión.

## Validación del primer cambio independiente

Antes de definir la recepción se comprobó la valoración de ajustes: tipos, lint, 24 unitarias, 40 pruebas de integración PostgreSQL y build del backend correctos. Las dos regresiones nuevas comprueban rechazo de un importe mayor que numeric(14,2) sin cambio de stock/auditoría, y una sola salida/auditoría ante dos bajas simultáneas, con importe exacto 0.30 para 3 unidades de 0.10.

`pnpm test:upgrade` conservó 21 tablas de negocio, concilió inventario y comprobó una segunda ejecución sin cambios sobre copia aislada. `pnpm db:check` encontró cero migraciones pendientes, diferencias de stock y números de pedido duplicados. Este cambio no añade esquema ni migra la DB habitual. No hubo cambios del frontend en este primer avance.
