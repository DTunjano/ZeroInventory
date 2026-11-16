export interface WompiOptions {
  environment: 'sandbox';
  publicKey: string;
  privateKey: string;
  integritySecret: string;
  eventsSecret: string;
  redirectUrl: string;
}

/** Live payments deliberately require a separately reviewed future release. */
export function parseWompiConfig(
  values: Record<string, unknown>,
): WompiOptions | null {
  const mode = values.WOMPI_MODE ?? 'disabled';
  if (mode === 'disabled') return null;
  if (mode !== 'sandbox')
    throw new Error(
      'WOMPI_MODE solo admite disabled o sandbox; producción no está autorizada',
    );
  const key = (name: string, prefix: string) => {
    const value = values[name];
    if (
      typeof value !== 'string' ||
      !value.startsWith(prefix) ||
      value.length < prefix.length + 8 ||
      value.trim() !== value
    )
      throw new Error(`${name} debe contener una credencial de Sandbox válida`);
    return value;
  };
  const redirect = values.WOMPI_REDIRECT_URL;
  let url: URL;
  try {
    url = new URL(typeof redirect === 'string' ? redirect : '');
  } catch {
    throw new Error('WOMPI_REDIRECT_URL debe ser una URL absoluta');
  }
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (
    url.username ||
    url.password ||
    url.hash ||
    (url.protocol !== 'https:' &&
      !(
        url.protocol === 'http:' &&
        loopback &&
        values.NODE_ENV !== 'production'
      ))
  )
    throw new Error(
      'WOMPI_REDIRECT_URL exige HTTPS; HTTP solo se admite en desarrollo local',
    );
  return {
    environment: 'sandbox',
    publicKey: key('WOMPI_PUBLIC_KEY', 'pub_test_'),
    privateKey: key('WOMPI_PRIVATE_KEY', 'prv_test_'),
    integritySecret: key('WOMPI_INTEGRITY_SECRET', 'test_integrity_'),
    eventsSecret: key('WOMPI_EVENTS_SECRET', 'test_events_'),
    redirectUrl: url.toString(),
  };
}
