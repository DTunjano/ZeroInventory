const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const envPath = path.join(root, '.env');
if (!fs.existsSync(envPath)) fs.copyFileSync(path.join(root, '.env.example'), envPath);
let current = fs.readFileSync(envPath, 'utf8');
const defaults = { NODE_ENV: 'development', CORS_ORIGINS: 'http://localhost:5173,http://localhost:5174',
  PGADMIN_DEFAULT_EMAIL: 'admin@zeroinventory.com', PGADMIN_DEFAULT_PASSWORD: randomBytes(24).toString('hex'),
  JWT_ACCESS_SECRET: randomBytes(48).toString('hex'), JWT_REFRESH_SECRET: randomBytes(48).toString('hex'),
  DB_PASSWORD: randomBytes(24).toString('hex') };
for (const [key, value] of Object.entries(defaults)) {
  if (!new RegExp(`^${key}=.+$`, 'm').test(current) || new RegExp(`^${key}=CHANGE_ME.*$`, 'm').test(current)) {
    current = current.replace(new RegExp(`^${key}=.*$`, 'm'), '');
    current += `\n${key}=${value}\n`;
  }
}
fs.writeFileSync(envPath, current);
const backendPath = path.join(root, 'backend/.env');
if (fs.existsSync(backendPath)) {
  let backend = fs.readFileSync(backendPath, 'utf8');
  const parsed = require('dotenv').parse(backend);
  for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
    if (parsed[key] && parsed[key].length < 32) {
      backend = backend.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${randomBytes(48).toString('hex')}`);
    }
  }
  fs.writeFileSync(backendPath, backend);
}
console.log('Entorno local preparado. Se conservaron las credenciales existentes. Los secretos no se muestran.');
console.log('backend/.env tiene precedencia sobre .env. pgAdmin con volumen existente conserva su contraseña anterior.');
