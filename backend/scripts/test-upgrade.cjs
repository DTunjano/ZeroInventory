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
    const before = {};
    for (const table of ds.entityMetadatas.map((m) => m.tableName)) {
      before[table] = Number((await ds.query(`SELECT count(*) AS n FROM "${table}"`))[0].n);
    }
    await ds.runMigrations({ transaction: 'all' });
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
