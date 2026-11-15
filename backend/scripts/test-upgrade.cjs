const { Client } = require('pg');
const { spawnSync } = require('node:child_process');
require('dotenv').config({ path: ['.env', '../.env'], quiet: true });
if (process.env.NODE_ENV === 'production') throw new Error('La prueba de actualización solo admite un entorno local');
const name = `zero_inventory_test_upgrade_${Date.now()}`;
const container = process.env.DB_CONTAINER ?? 'postgres-zero-inventory';
const sourceDatabase = process.env.DB_NAME;
const user = process.env.DB_USER;
const dump = `/tmp/${name}.dump`;
function docker(args) {
  const result = spawnSync('docker', ['exec', container, ...args], { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || 'Falló la operación de respaldo');
}
const client = new Client({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT ?? 5432), user,
  password: process.env.DB_PASSWORD, database: sourceDatabase });
(async () => {
  await client.connect();
  let created = false;
  let ds;
  try {
    docker(['pg_dump', '-U', user, '-d', sourceDatabase, '-Fc', '-f', dump]);
    await client.query(`CREATE DATABASE "${name}"`);
    created = true;
    docker(['pg_restore', '-U', user, '-d', name, '--no-owner', dump]);
    process.env.DB_NAME = name;
    delete process.env.DATABASE_URL;
    require('ts-node/register');
    ds = require('../config/data-source').default;
    await ds.initialize();
    let legacyPurchase;
    const schemaRunner = ds.createQueryRunner();
    try {
      if (!await schemaRunner.hasColumn('compra', 'estado')) {
        // Disposable fixtures in the restored copy only; exercise historical adoption even if source has no purchases.
        const [actor] = await ds.query('INSERT INTO usuario(username,password,is_active) VALUES($1,$2,true) RETURNING usuario_id', [`upgrade_qa_${Date.now()}`, 'fixture-never-used-for-authentication']);
        const [supplier] = await ds.query("INSERT INTO proveedor(nombre,is_active) VALUES('Proveedor QA de actualización',true) RETURNING proveedor_id");
        const [product] = await ds.query("INSERT INTO producto(proveedor_id,nombre,cantidad,precio,sku,is_active,created_at,updated_at) VALUES($1,'Producto QA de actualización',0,10,$2,true,NOW(),NOW()) RETURNING producto_id", [supplier.proveedor_id, `UPGRADE-QA-${Date.now()}`]);
        const [purchase] = await ds.query('INSERT INTO compra(proveedor_id,usuario_id,total) VALUES($1,$2,20) RETURNING compra_id', [supplier.proveedor_id, actor.usuario_id]);
        legacyPurchase = purchase.compra_id;
        await ds.query('INSERT INTO compra_detalle(compra_id,producto_id,cantidad,costo_unitario,subtotal) VALUES($1,$2,2,10,20)', [legacyPurchase, product.producto_id]);
      }
    } finally { await schemaRunner.release(); }
    const before = {};
    for (const table of ds.entityMetadatas.map((m) => m.tableName)) {
      const [{ exists }] = await ds.query('SELECT to_regclass($1) IS NOT NULL AS exists', [table]);
      if (!exists) continue; // A new migration may add a table not present in the restored source.
      before[table] = Number((await ds.query(`SELECT count(*) AS n FROM "${table}"`))[0].n);
    }
    await ds.runMigrations({ transaction: 'all' });
    if (before.pedido && before.pedido_evento === undefined) {
      const [adoptedOrders] = await ds.query('SELECT count(*)::int AS n FROM pedido WHERE version=0');
      if (adoptedOrders.n !== before.pedido) throw new Error('La adopción alteró el ciclo de los pedidos anteriores');
      const [inventedEvents] = await ds.query('SELECT count(*)::int AS n FROM pedido_evento');
      if (inventedEvents.n !== 0) throw new Error('Se inventó historial de pedidos anteriores');
    }
    if (legacyPurchase) {
      const [adopted] = await ds.query('SELECT estado,version,total,recibida_por,recibida_en FROM compra WHERE compra_id=$1', [legacyPurchase]);
      if (adopted.estado !== 'LEGACY' || adopted.version !== 1 || adopted.total !== '20.00' || adopted.recibida_por !== null || adopted.recibida_en !== null) throw new Error('La adopción de compras alteró el historial');
      const [events] = await ds.query('SELECT count(*)::int AS n FROM compra_evento WHERE compra_id=$1', [legacyPurchase]);
      if (events.n !== 0) throw new Error('Se inventaron eventos de una compra histórica');
    }
    for (const [table, count] of Object.entries(before)) {
      const after = Number((await ds.query(`SELECT count(*) AS n FROM "${table}"`))[0].n);
      if (after < count || (!['kardex', 'rol'].includes(table) && after !== count)) throw new Error(`Cambió inesperadamente el número de filas de ${table}`);
    }
    const differences = await ds.query(`SELECT p.producto_id FROM producto p LEFT JOIN (
      SELECT producto_id,SUM(CASE WHEN tipo_movimiento='ENTRADA' THEN cantidad WHEN tipo_movimiento='SALIDA' THEN -cantidad ELSE 0 END) balance FROM kardex GROUP BY producto_id
      ) k ON k.producto_id=p.producto_id WHERE p.cantidad <> COALESCE(k.balance,0)`);
    if (differences.length) throw new Error('Persisten diferencias de inventario');
    if ((await ds.runMigrations()).length) throw new Error('La migración no es idempotente');
    console.log(`Actualización de copia real: OK. ${Object.keys(before).length} tablas conservadas; inventario conciliado; segunda ejecución sin cambios.`);
  } finally {
    if (ds?.isInitialized) await ds.destroy();
    if (created) await client.query(`DROP DATABASE "${name}" WITH (FORCE)`);
    await client.end();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
