const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000';

async function request(method, path, body, extraHeaders = {}) {
  const url = new URL(path, baseUrl);
  const res = await fetch(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${method} ${path}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return { status: res.status, data };
}

async function ensureRole(nombre) {
  const qs = new URLSearchParams({ page: '1', limit: '50' });
  const roles = await request('GET', `/roles?${qs.toString()}`);
  const found = (roles.data?.data ?? []).find((r) => r.nombre === nombre);
  if (found) return found;

  await request('POST', '/roles', { nombre });
  const roles2 = await request('GET', `/roles?${qs.toString()}`);
  const found2 = (roles2.data?.data ?? []).find((r) => r.nombre === nombre);
  if (!found2) throw new Error(`No se pudo crear rol ${nombre}`);
  return found2;
}

async function createUser(username, password) {
  try {
    return await request('POST', '/usuarios', {
      username,
      password,
      primerNombre: 'Dev',
      segundoNombre: null,
      primerApellido: 'Customer',
      segundoApellido: null,
    });
  } catch (e) {
    // Si el username ya existe, lo buscamos.
    if (e.status !== 400 && e.status !== 409) throw e;
  }

  const qs = new URLSearchParams({ username, page: '1', limit: '10' });
  const users = await request('GET', `/usuarios?${qs.toString()}`);
  const user = (users.data?.data ?? []).find((u) => u.username === username);
  if (!user) throw new Error('No se pudo crear ni encontrar el usuario');
  return { status: 200, data: user };
}

async function ensureUsuarioRol(usuarioId, rolId) {
  const qs = new URLSearchParams({ usuarioId: String(usuarioId), page: '1', limit: '100' });
  const urs = await request('GET', `/usuario-roles?${qs.toString()}`);
  const already = (urs.data?.data ?? []).some((x) => x.rolId === rolId);
  if (already) return;
  await request('POST', '/usuario-roles', { usuarioId, rolId });
}

async function createCliente(usuarioId) {
  const documento = `DOC-${Date.now()}`;
  await request('POST', '/clientes', { usuarioId, tipoDocumento: 'CC', documento });

  const qs = new URLSearchParams({ usuarioId: String(usuarioId), page: '1', limit: '10' });
  const clientes = await request('GET', `/clientes?${qs.toString()}`);
  const cliente = (clientes.data?.data ?? []).find((c) => c.usuarioId === usuarioId);
  if (!cliente) throw new Error('No se pudo encontrar el cliente creado');
  return cliente;
}

async function createDireccion(clienteId) {
  const dir = await request('POST', '/direcciones', {
    clienteId,
    lineaDir: 'Calle 1 #2-3',
    barrio: 'Centro',
    codigoPostal: null,
    infoAdiccional: null,
  });
  return dir.data;
}

async function login(username, password) {
  const res = await request('POST', '/auth/login', { username, password });
  const token = res.data?.accessToken;
  if (!token) throw new Error('Login OK pero no devolvió accessToken');
  return token;
}

async function run() {
  console.log('Base URL:', baseUrl);

  const customerRole = await ensureRole('CUSTOMER');
  console.log('Rol CUSTOMER:', customerRole);

  const username = `devcustomer_${Date.now()}`;
  const password = 'Customer123!';

  const userRes = await createUser(username, password);
  const usuario = userRes.data;
  console.log('Usuario:', usuario);

  await ensureUsuarioRol(usuario.usuarioId, customerRole.rolId);
  console.log('Usuario-rol asignado');

  const cliente = await createCliente(usuario.usuarioId);
  console.log('Cliente:', cliente);

  const direccion = await createDireccion(cliente.clienteId);
  console.log('Direccion:', direccion);

  const token = await login(username, password);
  console.log('Access token OK');

  const auth = { authorization: `Bearer ${token}` };

  const add = await request('POST', '/carritos/me/items', { productoId: 1, cantidad: 2 }, auth);
  console.log('Add item:', add.data);

  const cart = await request('GET', '/carritos/me', undefined, auth);
  console.log('Cart:', cart.data);

  const checkout = await request(
    'POST',
    '/carritos/me/checkout',
    { direccionId: direccion.direccionId, metodoPago: 'EFECTIVO' },
    auth,
  );
  console.log('Checkout:', checkout.data);
}

run().catch((e) => {
  console.error('ERROR:', e.message);
  if (e.status) console.error('STATUS:', e.status);
  if (e.data) console.error('DATA:', JSON.stringify(e.data, null, 2));
  process.exit(1);
});
