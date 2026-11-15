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
    let orderEvents:unknown[]=[],orderTotals:unknown[]=[],orderPayments:unknown[]=[],orderLedger:unknown[]=[],orderRefunds:unknown[]=[];
    let legacyOrdersWithoutMatchingSale=0;
    if(tables.some(t=>t.tablename==='pedido_evento')) {
      orderEvents=await dataSource.query(`SELECT o.pedido_id FROM pedido o LEFT JOIN pedido_evento e USING(pedido_id) WHERE o.version>0 GROUP BY o.pedido_id HAVING COUNT(e.evento_id)<>o.version OR MAX(e.version)<>o.version`);
      orderTotals=await dataSource.query(`SELECT o.pedido_id FROM pedido o LEFT JOIN pedido_detalle d USING(pedido_id) WHERE o.version>0 GROUP BY o.pedido_id HAVING COUNT(d.pedido_detalle_id)=0 OR o.total<=0 OR o.total<>COALESCE(SUM(d.subtotal),0) OR BOOL_OR(d.cantidad<=0 OR d.precio_unitario<=0 OR d.subtotal<>d.cantidad*d.precio_unitario)`);
      orderPayments=await dataSource.query(`SELECT o.pedido_id FROM pedido o LEFT JOIN pago p USING(pedido_id) WHERE o.version>0 GROUP BY o.pedido_id HAVING COUNT(p.pago_id)=0 OR BOOL_OR(p.monto<>o.total) OR COUNT(*) FILTER(WHERE p.estado='APROBADO')>1 OR COUNT(*) FILTER(WHERE p.estado='PENDIENTE')>1 OR (o.estado IN ('ENVIADO','COMPLETADO','DEVUELTO') AND COUNT(*) FILTER(WHERE p.estado='APROBADO')<>1) OR (o.estado IN ('CANCELADO','DEVUELTO') AND COUNT(*) FILTER(WHERE p.estado='PENDIENTE')>0)`);
      orderRefunds=await dataSource.query(`SELECT o.pedido_id FROM pedido o LEFT JOIN pedido_reembolso r USING(pedido_id) WHERE o.version>0 AND ((r.pedido_id IS NOT NULL AND (o.estado NOT IN ('CANCELADO','DEVUELTO') OR r.monto<>o.total)) OR ((o.estado IN ('CANCELADO','DEVUELTO') AND EXISTS(SELECT 1 FROM pago p WHERE p.pedido_id=o.pedido_id AND p.estado='APROBADO'))<>(r.pedido_id IS NOT NULL)))`);
      orderLedger=await dataSource.query(`WITH lines AS (SELECT d.pedido_id,d.producto_id,SUM(d.cantidad) AS qty,SUM(d.subtotal) AS value FROM pedido_detalle d JOIN pedido o USING(pedido_id) WHERE o.version>0 GROUP BY d.pedido_id,d.producto_id), expected AS (
        SELECT l.*,'VENTA' AS ref,'SALIDA' AS direction FROM lines l UNION ALL
        SELECT l.*,CASE WHEN o.estado='CANCELADO' THEN 'CANCELACION_PEDIDO' ELSE 'DEVOLUCION_PEDIDO' END,'ENTRADA' FROM lines l JOIN pedido o USING(pedido_id) WHERE o.estado IN ('CANCELADO','DEVUELTO')
      ), actual AS (SELECT k.referencia_id AS pedido_id,k.producto_id,k.tipo_referencia::text AS ref,k.tipo_movimiento::text AS direction,SUM(k.cantidad) AS qty,SUM(k.valor_total) AS value FROM kardex k JOIN pedido o ON o.pedido_id=k.referencia_id WHERE o.version>0 AND k.tipo_referencia IN ('VENTA','CANCELACION_PEDIDO','DEVOLUCION_PEDIDO') GROUP BY k.referencia_id,k.producto_id,k.tipo_referencia,k.tipo_movimiento)
      SELECT COALESCE(e.pedido_id,a.pedido_id) AS pedido_id FROM expected e FULL JOIN actual a USING(pedido_id,producto_id,ref,direction) WHERE e.qty IS DISTINCT FROM a.qty OR e.value IS DISTINCT FROM a.value`);
      const [legacy]=await dataSource.query<{n:number}[]>(`WITH lines AS (SELECT d.pedido_id,d.producto_id,SUM(d.cantidad) AS qty FROM pedido_detalle d JOIN pedido o USING(pedido_id) WHERE o.version=0 GROUP BY d.pedido_id,d.producto_id) SELECT COUNT(DISTINCT pedido_id)::int AS n FROM lines l WHERE l.qty<>COALESCE((SELECT SUM(k.cantidad) FROM kardex k WHERE k.tipo_referencia='VENTA' AND k.tipo_movimiento='SALIDA' AND k.referencia_id=l.pedido_id AND k.producto_id=l.producto_id),0)`);
      legacyOrdersWithoutMatchingSale=legacy.n;
    }
    console.log(JSON.stringify({ tables: tables.map((t) => t.tablename), migrationsPending, stockInconsistencies: inconsistencies, duplicateOrderNumbers: duplicates,
      purchaseTotalInconsistencies: purchaseTotals, purchaseReceiptInconsistencies: purchaseReceipts, purchaseEventInconsistencies: purchaseEvents,
      orderEventInconsistencies:orderEvents,orderTotalInconsistencies:orderTotals,orderPaymentInconsistencies:orderPayments,orderLedgerInconsistencies:orderLedger,orderRefundInconsistencies:orderRefunds,legacyOrdersWithoutMatchingSale }, null, 2));
    if (migrationsPending || inconsistencies.length || duplicates.length || purchaseTotals.length || purchaseReceipts.length || purchaseEvents.length || orderEvents.length || orderTotals.length || orderPayments.length || orderLedger.length || orderRefunds.length) process.exitCode = 1;
  } finally { await dataSource.destroy(); }
}
void main().catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
