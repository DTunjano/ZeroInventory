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
    console.log(JSON.stringify({ tables: tables.map((t) => t.tablename), migrationsPending: await dataSource.showMigrations(), stockInconsistencies: inconsistencies, duplicateOrderNumbers: duplicates }, null, 2));
    if (inconsistencies.length || duplicates.length) process.exitCode = 1;
  } finally { await dataSource.destroy(); }
}
void main().catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
