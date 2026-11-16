// Invoked from frontend by pnpm test:e2e. Owns every process and DB it creates.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawn } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const { createServer } = require('node:net');
const { mkdir, rm } = require('node:fs/promises');
const { createRequire } = require('node:module');
const { Client } = require('pg');
const { assertIsolatedDatabase } = require('./browser-test-safety.cjs');
const backend = path.resolve(__dirname, '..');
const frontend = path.resolve(backend, '../frontend');
const frontRequire = createRequire(path.join(frontend, 'package.json'));
require('dotenv').config({ path: [path.join(backend, '.env'), path.join(backend, '../.env')], quiet: true });

const original = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).pathname.slice(1) : process.env.DB_NAME;
if (!original) throw new Error('Configura la conexión de DB antes de ejecutar las pruebas de navegador');
const ssl = process.env.DB_SSL === 'true' || (process.env.NODE_ENV === 'production' && process.env.DB_SSL !== 'false')
  ? { rejectUnauthorized: true, ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n') } : {}) } : false;
const database = assertIsolatedDatabase(`zero_inventory_test_browser_${Date.now()}_${randomBytes(6).toString('hex')}`, original);
const buildRoot = path.resolve(frontend, '../.local/browser-build');
const buildDirectory = path.join(buildRoot, database);
const maintenance = new Client(process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl, connectionTimeoutMillis: 10000,
} : {
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: original, ssl, connectionTimeoutMillis: 10000,
});
let created = false, buildOwned = false, app, preview, child, migration;
let interrupted = false;
async function freePort() {
  const server = createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}
function run(file, args, options) {
  return new Promise((resolve, reject) => {
    child = spawn(process.execPath, [file, ...args], { stdio: 'inherit', windowsHide: true, ...options });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      child = undefined;
      if (code !== 0) reject(new Error(`Proceso de pruebas terminó con ${code ?? signal}`));
      else resolve();
    });
  });
}
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
  interrupted = true;
  if (child) child.kill('SIGTERM');
});

async function main() {
  process.chdir(backend);
  try {
    await run(require.resolve('@nestjs/cli/bin/nest.js'), ['build'], { cwd: backend });
    if (interrupted) throw new Error('Pruebas interrumpidas antes de crear DB');
    await maintenance.connect();
    await maintenance.query(`CREATE DATABASE "${assertIsolatedDatabase(database, original)}"`);
    created = true;
    Object.assign(process.env, {
      DB_NAME: database, DB_SSL: ssl ? 'true' : 'false', NODE_ENV: 'test', PORT: '3000',
      JWT_ACCESS_SECRET: randomBytes(48).toString('hex'), JWT_REFRESH_SECRET: randomBytes(48).toString('hex'),
      COOKIE_SECURE: 'false', COOKIE_SAME_SITE: 'lax',
      CLOUDINARY_NAME: 'browser-tests-disabled', CLOUDINARY_KEY: 'disabled', CLOUDINARY_SECRET: 'disabled',
      WOMPI_MODE: 'sandbox', WOMPI_PUBLIC_KEY: 'pub_test_browser_only', WOMPI_PRIVATE_KEY: 'prv_test_browser_only',
      WOMPI_INTEGRITY_SECRET: 'test_integrity_browser_only', WOMPI_EVENTS_SECRET: 'test_events_browser_only',
      WOMPI_REDIRECT_URL: 'http://localhost/me/orders',
    });
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL); url.pathname = `/${database}`; process.env.DATABASE_URL = url.toString();
    }
    migration = require('../dist/config/data-source').default;
    await migration.initialize();
    await migration.runMigrations({ transaction: 'all' });
    await migration.destroy();
    const apiPort = await freePort();
    let frontendPort = await freePort();
    while (frontendPort === apiPort) frontendPort = await freePort();
    const baseURL = `http://127.0.0.1:${frontendPort}`;
    process.env.CORS_ORIGINS = baseURL;
    process.env.WOMPI_REDIRECT_URL = `${baseURL}/me/orders`;
    const { Test } = require('@nestjs/testing');
    const { AppModule } = require('../dist/src/app.module');
    const { WompiGateway } = require('../dist/src/wompi/domain/wompi.types');
    // A controlled provider double. No Sandbox or production HTTP calls in E2E.
    const lookups = new Map();
    const wompi = { transaction: async id => {
      if (!/^qa-(approved|transition)-\d+$/.test(id)) throw new Error('Identificador QA no autorizado');
      const [row] = await app.get(require('typeorm').DataSource).query(
        'SELECT i.referencia,p.monto FROM wompi_intento i JOIN pago p USING(pago_id) WHERE p.pago_id=$1', [Number(id.split('-').at(-1))]);
      if (!row) throw new Error('Intento QA no encontrado');
      const previous = lookups.get(id) ?? 0; lookups.set(id, previous + 1);
      return { id, reference: row.referencia, amountInCents: Math.round(Number(row.monto) * 100), currency: 'COP', status: id.startsWith('qa-transition-') && previous === 0 ? 'PENDING' : 'APPROVED' };
    } };
    // Fail locally before any Cloudinary SDK method can transmit a test asset.
    const blocked = () => { throw new Error('Servicios externos deshabilitados en pruebas de navegador'); };
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider('CLOUDINARY').useValue({ uploader: { upload_stream: blocked, destroy: blocked }, api: { delete_resources: blocked } })
      .overrideProvider(WompiGateway).useValue(wompi).compile();
    app = module.createNestApplication({ logger: ['error', 'warn'] });
    const apiURL = `http://127.0.0.1:${apiPort}`;
    const password = `BrowserQa9-${randomBytes(12).toString('hex')}!`;
    const db = app.get(require('typeorm').DataSource);
    const hash = await require('bcrypt').hash(password, 10);
    for (const role of ['ADMIN', 'EMPLOYEE']) {
      const [user] = await db.query('INSERT INTO usuario(username,password,is_active) VALUES($1,$2,true) RETURNING usuario_id', [`browser_${role.toLowerCase()}`, hash]);
      await db.query('INSERT INTO usuario_rol(usuario_id,rol_id) SELECT $1,rol_id FROM rol WHERE nombre=$2', [user.usuario_id, role]);
    }
    const { build, preview: serve } = await import(pathToFileURL(frontRequire.resolve('vite')).href);
    process.chdir(frontend);
    process.env.VITE_API_URL = apiURL;
    await mkdir(buildRoot, { recursive: true });
    await mkdir(buildDirectory);
    buildOwned = true;
    process.env.NODE_ENV = 'production';
    try {
      await build({ root: frontend, logLevel: 'warn', build: { outDir: buildDirectory, emptyOutDir: false } });
    } finally { process.env.NODE_ENV = 'test'; }
    preview = await serve({ root: frontend, build: { outDir: buildDirectory }, preview: { host: '127.0.0.1', port: frontendPort, strictPort: true } });
    require('../dist/config/http.config').configureHttp(app);
    await app.listen(apiPort, '127.0.0.1');
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^(DB_|DATABASE_URL$|JWT_|CLOUDINARY_|PGADMIN_|WOMPI_)/.test(key)));
    Object.assign(env, { E2E_ISOLATED_RUN: database, E2E_BASE_URL: baseURL, E2E_API_URL: apiURL, E2E_PASSWORD: password });
    if (interrupted) throw new Error('Pruebas interrumpidas');
    console.log('Navegador: API y frontend propios, puertos aleatorios y DB temporal; servicios externos deshabilitados.');
    await run(frontRequire.resolve('@playwright/test/cli'), ['test', ...process.argv.slice(2)], { cwd: frontend, env });
    // Same production diagnostic, against the isolated DB only.
    await run(require.resolve('ts-node/dist/bin.js'), ['scripts/check-database.ts'], { cwd: backend, env: process.env });
  } finally {
    const closed = await Promise.allSettled([
      preview ? new Promise((resolve, reject) => preview.httpServer.close(error => error ? reject(error) : resolve())) : Promise.resolve(),
      app ? app.close() : Promise.resolve(),
      migration?.isInitialized ? migration.destroy() : Promise.resolve(),
    ]);
    try {
      if (created) {
        await maintenance.query(`DROP DATABASE "${assertIsolatedDatabase(database, original)}" WITH (FORCE)`);
        const remaining = await maintenance.query('SELECT 1 FROM pg_database WHERE datname=$1', [database]);
        if (remaining.rowCount) throw new Error('La DB temporal no se retiró');
        console.log('DB temporal retirada y procesos propios cerrados; datos habituales conservados.');
      }
    } finally { await maintenance.end(); }
    if (buildOwned && path.dirname(path.resolve(buildDirectory)) === buildRoot && path.basename(buildDirectory) === assertIsolatedDatabase(database, original)) {
      await rm(buildDirectory, { recursive: true, force: true });
    }
    if (closed.some(result => result.status === 'rejected')) throw new Error('No se pudieron cerrar todos los procesos de QA');
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
