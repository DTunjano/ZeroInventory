const { Client } = require('pg');
const { spawnSync } = require('node:child_process');
const { randomBytes } = require('node:crypto');
require('dotenv').config({ path: ['.env', '../.env'], quiet: true });

// A fresh isolated database is created for each run; never reset the user's DB.
const name = `zero_inventory_test_${Date.now()}_${randomBytes(3).toString('hex')}`;
const client = new Client(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false } : {
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
});

(async () => {
  await client.connect();
  let created = false;
  try {
    await client.query(`CREATE DATABASE "${name}"`);
    created = true;
    const env = { ...process.env, DB_NAME: name, TEST_DATABASE_NAME: name, NODE_ENV: 'test',
      JWT_ACCESS_SECRET: randomBytes(48).toString('hex'), JWT_REFRESH_SECRET: randomBytes(48).toString('hex') };
    if (env.DATABASE_URL) { const url = new URL(env.DATABASE_URL); url.pathname = `/${name}`; env.DATABASE_URL = url.toString(); }
    const result = spawnSync(process.execPath, [process.env.npm_execpath, 'exec', 'jest', '--config', './test/jest-e2e.json', '--runInBand'], { env, stdio: 'inherit' });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  } finally {
    if (created) await client.query(`DROP DATABASE "${name}" WITH (FORCE)`);
    await client.end();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
