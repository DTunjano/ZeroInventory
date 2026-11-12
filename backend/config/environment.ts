import { config } from 'dotenv';
import { resolve } from 'node:path';

// Both Nest and the CLI load the same files. Existing process variables win.
export function loadEnvironment() {
  config({ path: [resolve(__dirname, '../.env'), resolve(__dirname, '../../.env')], quiet: true });
}

export function validateEnvironment(values: Record<string, unknown>) {
  for (const name of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
    if (typeof values[name] !== 'string' || (values[name]).length < 32) {
      throw new Error(`${name} debe contener al menos 32 caracteres. Ejecuta pnpm setup:env.`);
    }
  }
  if (values.JWT_ACCESS_SECRET === values.JWT_REFRESH_SECRET) {
    throw new Error('Los secretos de acceso y renovación deben ser diferentes.');
  }
  if (!values.DATABASE_URL) {
    for (const name of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
      if (!values[name]) throw new Error(`Falta ${name}. Ejecuta pnpm setup:env.`);
    }
  }
  const port = Number(values.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválido');
  if (values.NODE_ENV === 'production' && values.COOKIE_SECURE === 'false') {
    throw new Error('COOKIE_SECURE no puede ser false en producción');
  }
  if (values.COOKIE_SAME_SITE && !['lax', 'strict', 'none'].includes((typeof values.COOKIE_SAME_SITE === 'string' ? values.COOKIE_SAME_SITE : ''))) {
    throw new Error('COOKIE_SAME_SITE debe ser lax, strict o none');
  }
  if (values.COOKIE_SAME_SITE === 'none' && values.NODE_ENV !== 'production' && values.COOKIE_SECURE !== 'true') {
    throw new Error('COOKIE_SAME_SITE=none requiere COOKIE_SECURE=true');
  }
  const origins = (typeof values.CORS_ORIGINS === 'string' ? values.CORS_ORIGINS : '').split(',').filter(Boolean);
  if (values.NODE_ENV === 'production' && origins.length === 0) {
    throw new Error('CORS_ORIGINS es obligatorio en producción');
  }
  for (const origin of origins) {
    const url = new URL(origin.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin.trim()) {
      throw new Error('CORS_ORIGINS debe contener orígenes HTTP sin rutas');
    }
  }
  return values;
}
