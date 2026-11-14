import dataSource from '../config/data-source';

async function main() {
  await dataSource.initialize();
  try {
    const tables: { tablename: string }[] = await dataSource.query(`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`);
    const inconsistencies: unknown[] = await dataSource.query(`
      SELECT p.producto_id,p.cantidad,COALESCE(k.balance,0) AS saldo_kardex
      FROM producto p LEFT JOIN (
        SELECT producto_id,SUM(CASE WHEN tipo_movimiento='ENTRADA' THEN cantidad WHEN tipo_movimiento='SALIDA' THEN -cantidad ELSE 0 END) balance
        FROM kardex GROUP BY producto_id
      ) k ON k.producto_id=p.producto_id WHERE p.cantidad <> COALESCE(k.balance,0)`);
    const duplicates: unknown[] = await dataSource.query(`SELECT cliente_id,numero_pedido_usuario,COUNT(*) FROM pedido GROUP BY cliente_id,numero_pedido_usuario HAVING COUNT(*)>1`);
    const migrationsPending = await dataSource.showMigrations();
    let purchaseTotals: unknown[] = []; let purchaseReceipts: unknown[] = []; let purchaseEvents: unknown[] = [];
    if (tables.some(table => table.tablename === 'compra_evento')) {
      purchaseTotals = await dataSource.query(`SELECT c.compra_id FROM compra c LEFT JOIN compra_detalle d ON d.compra_id=c.compra_id
        WHERE c.estado<>'LEGACY' GROUP BY c.compra_id HAVING COUNT(d.compra_detalle_id)=0 OR c.total<=0 OR c.total<>COALESCE(SUM(d.subtotal),0)
        OR BOOL_OR(d.cantidad<=0 OR d.costo_unitario<=0 OR d.subtotal<>d.cantidad*d.costo_unitario)`);
      purchaseReceipts = await dataSource.query(`WITH expected AS (
        SELECT d.compra_id,d.producto_id,d.cantidad,d.costo_unitario,d.subtotal FROM compra_detalle d JOIN compra c ON c.compra_id=d.compra_id WHERE c.estado='RECIBIDA'
      ), actual AS (
        SELECT referencia_id AS compra_id,producto_id,COUNT(*) AS rows,SUM(cantidad) AS quantity,SUM(valor_total) AS total,
          MIN(costo_unitario) AS min_cost,MAX(costo_unitario) AS max_cost,BOOL_AND(tipo_movimiento='ENTRADA') AS entries
        FROM kardex WHERE tipo_referencia='RECEPCION_COMPRA' GROUP BY referencia_id,producto_id
      ) SELECT COALESCE(e.compra_id,a.compra_id) AS compra_id,COALESCE(e.producto_id,a.producto_id) AS producto_id
        FROM expected e FULL JOIN actual a ON e.compra_id=a.compra_id AND e.producto_id=a.producto_id
        WHERE e.compra_id IS NULL OR a.rows IS NULL OR a.rows<>1 OR NOT a.entries OR e.cantidad<>a.quantity
          OR e.subtotal<>a.total OR e.costo_unitario<>a.min_cost OR e.costo_unitario<>a.max_cost`);
      purchaseEvents = await dataSource.query(`SELECT c.compra_id FROM compra c LEFT JOIN compra_evento e ON e.compra_id=c.compra_id
        WHERE c.estado<>'LEGACY' GROUP BY c.compra_id HAVING COUNT(e.evento_id)<>c.version OR MAX(e.version)<>c.version`);
    }
    console.log(JSON.stringify({ tables: tables.map((t) => t.tablename), migrationsPending, stockInconsistencies: inconsistencies, duplicateOrderNumbers: duplicates,
      purchaseTotalInconsistencies: purchaseTotals, purchaseReceiptInconsistencies: purchaseReceipts, purchaseEventInconsistencies: purchaseEvents }, null, 2));
    if (migrationsPending || inconsistencies.length || duplicates.length || purchaseTotals.length || purchaseReceipts.length || purchaseEvents.length) process.exitCode = 1;
  } finally { await dataSource.destroy(); }
}
void main().catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
