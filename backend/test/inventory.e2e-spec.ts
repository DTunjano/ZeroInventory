import { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import dataSource from '../config/data-source';
import { UpdateProductUseCase } from '../src/producto/application/use-cases/update-product.use-case';
import { CreateOrderUseCase } from '../src/carrito/application/use-cases/create-order.use-case';
import { ValidateCartStockUseCase } from '../src/carrito/application/use-cases/validate-cart-stock.use-case';
import { MetodoPagoEnum } from '../src/pago/domain/entity/pago.entity';
import { configureHttp } from '../config/http.config';

jest.setTimeout(60000);

describe('Inventory and customer flows on isolated PostgreSQL', () => {
  let app: INestApplication<Server>;
  let db: DataSource;
  let adminToken: string;
  let adminId: number;
  let supplierId: number;
  let categoryId: number;
  let sequence = 0;
  const password = 'Integration123!';
  const timestamp = (value: unknown): number => {
    if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) throw new Error('Se esperaba un instante ISO válido');
    return Date.parse(value);
  };
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
  const api = () => request(app.getHttpServer());

  beforeAll(async () => {
    if (!process.env.TEST_DATABASE_NAME?.startsWith('zero_inventory_test_') || process.env.DB_NAME !== process.env.TEST_DATABASE_NAME) {
      throw new Error('Estas pruebas solo admiten una base temporal creada por pnpm test:integration');
    }
    await dataSource.initialize();
    await dataSource.runMigrations({ transaction: 'all' });
    await dataSource.destroy();
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    configureHttp(app);
    await app.init();
    db = app.get(DataSource);
    const [user] = await db.query(`INSERT INTO usuario(username,password,is_active) VALUES($1,$2,true) RETURNING usuario_id`, ['integration_admin', await bcrypt.hash(password, 10)]);
    adminId = user.usuario_id;
    await db.query(`INSERT INTO usuario_rol(usuario_id,rol_id) SELECT $1,rol_id FROM rol WHERE nombre='ADMIN'`, [adminId]);
    const login = await api().post('/auth/login').send({ username: 'integration_admin', password }).expect(201);
    adminToken = login.body.accessToken;
    const [supplier] = await db.query(`INSERT INTO proveedor(nombre,is_active) VALUES('Proveedor integración',true) RETURNING proveedor_id`);
    supplierId = supplier.proveedor_id;
    const [category] = await db.query(`INSERT INTO categoria(nombre,created_at,updated_at) VALUES('Categoría integración',NOW(),NOW()) RETURNING categoria_id`);
    categoryId = category.categoria_id;
  });
  afterAll(async () => { if (app) await app.close(); });

  async function customer() {
    const username = `customer_${++sequence}`;
    const registered = await api().post('/auth/register').send({ username, password, documento: `DOC-${sequence}`, primerNombre: 'Prueba' }).expect(201);
    const token = registered.body.accessToken as string;
    const address = await api().post('/direcciones/me').set(auth(token)).send({ lineaDir: 'Calle de pruebas', barrio: 'Centro' }).expect(201);
    const [client] = await db.query('SELECT cliente_id FROM cliente WHERE usuario_id=$1', [registered.body.user.usuarioId]);
    return { token, userId: registered.body.user.usuarioId as number, clientId: client.cliente_id as number, addressId: address.body.direccionId as number };
  }
  async function product(stock = 10, price = 100) {
    const result = await api().post('/productos').set(auth(adminToken)).send({ nombre: `Producto prueba ${++sequence}`, cantidad: stock, precio: price, proveedorId: supplierId, categoriaIds: [categoryId] }).expect(201);
    return result.body as { productoId: number; cantidad: number; sku: string };
  }
  async function balance(id: number) {
    const [row] = await db.query(`SELECT p.cantidad,COALESCE(SUM(CASE WHEN k.tipo_movimiento='ENTRADA' THEN k.cantidad WHEN k.tipo_movimiento='SALIDA' THEN -k.cantidad ELSE 0 END),0)::int AS balance FROM producto p LEFT JOIN kardex k ON k.producto_id=p.producto_id WHERE p.producto_id=$1 GROUP BY p.producto_id`, [id]);
    expect(row.cantidad).toBe(row.balance);
    return row.cantidad as number;
  }
  const checkout = (c: { token: string; addressId: number }) => api().post('/carritos/me/checkout').set(auth(c.token)).send({ direccionId: c.addressId, metodoPago: 'EFECTIVO' });
  async function add(c: { token: string }, productId: number, quantity = 1) {
    return api().post('/carritos/me/items').set(auth(c.token)).send({ productoId: productId, cantidad: quantity }).expect(201);
  }

  it('migrates a fresh database and is idempotent', async () => {
    expect(await db.showMigrations()).toBe(false);
    expect(await db.runMigrations()).toHaveLength(0);
    expect((await db.query(`SELECT tablename FROM pg_tables WHERE schemaname='public'`)).length).toBe(25);
  });
  it('allows public catalogues and blocks unauthenticated private data', async () => {
    await api().get('/productos').expect(200);
    await api().get('/roles').expect(401);
    await api().get('/carritos').expect(401);
    await api().get('/direcciones').expect(401);
  });
  it('hides inactive media from public reads while preserving administrator management', async () => {
    const [media] = await db.query(`INSERT INTO media(tipo,titulo,url,"publicId",estado) VALUES('video','QA sin servicio externo','https://example.test/qa.mp4','qa-integration-only','activo') RETURNING "mediaId"`);
    await api().get(`/media/${media.mediaId}`).expect(200);
    await api().patch(`/media/${media.mediaId}/toggle-status`).set(auth(adminToken)).expect(200);
    await api().get(`/media/${media.mediaId}`).expect(404);
    const visible = await api().get('/media').expect(200);
    expect(visible.body.data.some((row: { mediaId: number }) => row.mediaId === media.mediaId)).toBe(false);
    const managed = await api().get('/media/admin/all').set(auth(adminToken)).expect(200);
    expect(managed.body.data.some((row: { mediaId: number }) => row.mediaId === media.mediaId)).toBe(true);
    await api().patch(`/media/${media.mediaId}/toggle-status`).set(auth(adminToken)).expect(200);
    await api().get(`/media/${media.mediaId}`).expect(200);
  });
  it('restricts reports to administrators and rejects invalid or excessive date ranges', async () => {
    await api().get('/admin/reports').expect(401);
    const c = await customer();
    await api().get('/admin/reports').set(auth(c.token)).expect(403);
    const created = await api().post('/usuarios').set(auth(adminToken)).send({ username: `report_employee_${++sequence}`, password, roles: ['EMPLOYEE'] }).expect(201);
    const login = await api().post('/auth/login').send({ username: created.body.username, password }).expect(201);
    await api().get('/admin/reports').set(auth(login.body.accessToken as string)).expect(403);
    for (const query of [{ dateFrom: '2026-02-30' }, { dateFrom: '2026-11-12', dateTo: '2026-11-01' }, { dateFrom: '2020-01-01', dateTo: '2026-11-12' }, { sortBy: 'injected' }]) {
      await api().get('/admin/reports').set(auth(adminToken)).query(query).expect(400);
    }
  });
  it('aggregates reports without multiplying orders by payment or detail rows', async () => {
    const c = await customer(); const first = await product(3, 10); const second = await product(3, 20);
    await add(c, first.productoId); await add(c, second.productoId);
    const order = await checkout(c).expect(201);
    const id = order.body.pedidoId as number;
    await db.query("UPDATE pedido SET fecha='2026-03-01 23:59:59',registrada_en=NULL WHERE pedido_id=$1", [id]);
    await db.query("UPDATE pago SET estado='APROBADO',fecha_pago='2026-03-02 23:59:59',registrado_en=NULL,decidido_en=NULL WHERE pedido_id=$1", [id]);
    await db.query("INSERT INTO pago(pedido_id,metodo_pago,monto,estado,fecha_pago) VALUES($1,'TRANSFERENCIA',5,'PENDIENTE','2026-03-02'),($1,'TRANSFERENCIA',500,'APROBADO','2026-03-03')", [id]);
    const report = await api().get('/admin/reports').set(auth(adminToken)).query({ dateFrom: '2026-03-01', dateTo: '2026-03-02' }).expect(200);
    expect(report.body.summary).toEqual({ orders: 1, orderTotal: 30, approvedPayments: 30, pendingPayments: 5 });
    expect(report.body.daily).toEqual([{ date: '2026-03-01', orders: 1, total: 30 }]);
    expect(report.body.states).toEqual([{ state: 'CONFIRMADO', orders: 1, total: 30 }]);
    expect(report.body.methods).toEqual([{ method: 'EFECTIVO', payments: 1, amount: 30 }]);
    expect(report.body.topProducts.map((row: { units: number; total: number }) => [row.units, row.total])).toEqual([[1, 10], [1, 20]]);
    expect(report.body.inventory.lowStock.every((row: { quantity: number }) => row.quantity <= 5)).toBe(true);
  });
  it('returns empty report periods with numeric zeros rather than null aggregates', async () => {
    const result = await api().get('/admin/reports').set(auth(adminToken)).query({ dateFrom: '1900-01-01', dateTo: '1900-01-01' }).expect(200);
    expect(result.body.summary).toEqual({ orders: 0, orderTotal: 0, approvedPayments: 0, pendingPayments: 0 });
    expect(result.body.daily).toEqual([]); expect(result.body.topProducts).toEqual([]);
  });
  it('registers distinct customers and enforces their role', async () => {
    const first = await customer(); const second = await customer();
    expect(first.userId).not.toBe(second.userId);
    expect(first.userId).toBeGreaterThan(0);
    await api().post('/productos').set(auth(first.token)).send({ nombre: 'No autorizado', cantidad: 1, precio: 1 }).expect(403);
    await api().get('/settings/appearance').set(auth(first.token)).expect(200);
  });
  it('registers one customer for a concurrent duplicate document without orphan accounts', async () => {
    const suffix = ++sequence;
    const usernames = [`registration_a_${suffix}`, `registration_b_${suffix}`];
    const results = await Promise.all(usernames.map((username) => api().post('/auth/register').send({ username, password, documento: `REG-CONCURRENT-${suffix}`, tipoDocumento: 'CE' })));
    expect(results.map((result) => result.status).sort()).toEqual([201, 409]);
    expect((await db.query('SELECT 1 FROM usuario WHERE username=ANY($1::text[])', [usernames])).length).toBe(1);
    const [profile] = await db.query('SELECT tipo_documento FROM cliente WHERE documento=$1', [`REG-CONCURRENT-${suffix}`]);
    expect(profile.tipo_documento).toBe('CE');
  });
  it('filters and sorts only the authenticated customer orders with inclusive end dates', async () => {
    const c = await customer(); const other = await customer();
    const first = await product(2, 100); const second = await product(2, 200);
    await add(c, first.productoId); const orderA = await checkout(c).expect(201);
    await add(c, second.productoId); const orderB = await checkout(c).expect(201);
    await db.query("UPDATE pedido SET fecha='2026-01-02 23:59:59',registrada_en=NULL,estado='COMPLETADO' WHERE pedido_id=$1", [orderA.body.pedidoId]);
    await db.query("UPDATE pedido SET fecha='2026-01-03 00:00:00',registrada_en=NULL WHERE pedido_id=$1", [orderB.body.pedidoId]);
    const sorted = await api().get('/pedidos/me').set(auth(c.token)).query({ sortBy: 'total_asc' }).expect(200);
    expect(sorted.body.map((order: { total: number }) => order.total)).toEqual([100, 200]);
    const filtered = await api().get('/pedidos/me').set(auth(c.token)).query({ dateFrom: '2026-01-02', dateTo: '2026-01-02', estado: 'COMPLETADO' }).expect(200);
    expect(filtered.body.map((order: { pedidoId: number }) => order.pedidoId)).toEqual([orderA.body.pedidoId]);
    await api().get('/pedidos/me').set(auth(other.token)).expect(200).expect((result) => expect(result.body).toEqual([]));
    for (const query of [{ dateFrom: '2026-02-30' }, { dateFrom: '2026-02-02', dateTo: '2026-01-01' }, { sortBy: 'total; DROP TABLE pedido' }, { estado: 'PAID' }, { clienteId: c.clientId }]) {
      await api().get('/pedidos/me').set(auth(c.token)).query(query).expect(400);
    }
  });
  it('creates employee, account and role atomically and rolls back an account conflict', async () => {
    const suffix = ++sequence;
    const email = `employee-create-${suffix}@example.test`;
    const created = await api().post('/empleados').set(auth(adminToken)).send({ nombre: 'Empleado ficticio', email, password, documento: `EMP-${suffix}` }).expect(201);
    expect(created.body.usuarioId).toBeGreaterThan(0);
    const login = await api().post('/auth/login').send({ username: email, password }).expect(201);
    expect(login.body.user.roles).toEqual(['EMPLOYEE']);
    const collisionEmail = `employee-collision-${suffix}@example.test`;
    await api().post('/usuarios').set(auth(adminToken)).send({ username: collisionEmail, password, roles: ['EMPLOYEE'] }).expect(201);
    await api().post('/empleados').set(auth(adminToken)).send({ nombre: 'No debe persistirse', email: collisionEmail, password }).expect(409);
    expect((await db.query('SELECT 1 FROM empleado WHERE email=$1', [collisionEmail])).length).toBe(0);
  });
  it('filters inactive suppliers and keeps repeated logical deactivation idempotent', async () => {
    const nombre = `Proveedor estado ${++sequence}`;
    const created = await api().post('/proveedores').set(auth(adminToken)).send({ nombre }).expect(201);
    const id = created.body.proveedorId as number;
    for (let index = 0; index < 2; index++) await api().put(`/proveedores/${id}`).set(auth(adminToken)).send({ isActive: false }).expect(200);
    const inactive = await api().get('/proveedores').set(auth(adminToken)).query({ nombre, isActive: false }).expect(200);
    expect(inactive.body.data.map((supplier: { proveedorId: number }) => supplier.proveedorId)).toEqual([id]);
    await api().get('/proveedores').set(auth(adminToken)).query({ nombre, isActive: true }).expect(200).expect((result) => expect(result.body.total).toBe(0));
    await api().get(`/proveedores/${id}/productos-suministrados`).set(auth(adminToken)).expect(200).expect((result) => expect(result.body.total).toBe(0));
    await api().put(`/proveedores/${id}`).set(auth(adminToken)).send({ isActive: true }).expect(200);
  });
  it('rejects expired access, renews a customer session and validates self-service password changes', async () => {
    const c = await customer();
    const [user] = await db.query<{ username: string }[]>('SELECT username FROM usuario WHERE usuario_id=$1', [c.userId]);
    const expired = await app.get(JwtService).signAsync({ sub: c.userId }, { expiresIn: -1 });
    await api().get('/settings').set(auth(expired)).expect(401);
    const login = await api().post('/auth/login').send({ username: user.username, password }).expect(201);
    const cookies = login.headers['set-cookie'] as unknown as string[];
    const renewed = await api().post('/auth/refresh').set('Cookie', cookies[0].split(';')[0]).expect(201);
    await api().get('/settings').set(auth(renewed.body.accessToken as string)).expect(200);
    await api().put('/settings').set(auth(c.token)).send({ primerNombre: 'Perfil editado QA' }).expect(200);
    await api().get('/settings').set(auth(c.token)).expect(200).expect((result) => expect(result.body.profile.primerNombre).toBe('Perfil editado QA'));
    const changedPassword = 'OwnChanged123!';
    await api().patch('/settings/password').set(auth(c.token)).send({ currentPassword: 'Wrong123!', newPassword: changedPassword, confirmPassword: changedPassword }).expect(401);
    await api().patch('/settings/password').set(auth(c.token)).send({ currentPassword: password, newPassword: changedPassword, confirmPassword: 'Mismatch123!' }).expect(401);
    await api().patch('/settings/password').set(auth(c.token)).send({ currentPassword: password, newPassword: changedPassword, confirmPassword: changedPassword }).expect(200);
    await api().post('/auth/login').send({ username: user.username, password }).expect(401);
    await api().post('/auth/login').send({ username: user.username, password: changedPassword }).expect(201);
    const employee = await api().post('/usuarios').set(auth(adminToken)).send({ username: `settings_employee_${++sequence}`, password, roles: ['EMPLOYEE'] }).expect(201);
    const employeeLogin = await api().post('/auth/login').send({ username: employee.body.username, password }).expect(201);
    const employeeAuth = auth(employeeLogin.body.accessToken as string);
    await api().get('/settings').set(employeeAuth).expect(403);
    await api().patch('/settings/password').set(employeeAuth).send({ currentPassword: password, newPassword: changedPassword, confirmPassword: changedPassword }).expect(403);
    await api().patch('/settings/appearance').set(employeeAuth).send({ theme: 'dark' }).expect(200);
  });
  it('validates DTOs, fractional stock, negative prices and extra fields', async () => {
    for (const payload of [{ cantidad: 1.5, precio: 10 }, { cantidad: 1, precio: -1 }, { cantidad: 1, precio: 10, extra: true }]) {
      await api().post('/productos').set(auth(adminToken)).send({ nombre: 'Inválido', ...payload }).expect(400);
    }
  });
  it('requires supplier, categories and positive price while allowing no image', async () => {
    const valid = { nombre: `Sin imagen ${++sequence}`, cantidad: 3, precio: 1, proveedorId: supplierId, categoriaIds: [categoryId] };
    for (const invalid of [{ proveedorId: undefined }, { proveedorId: null }, { categoriaIds: undefined }, { categoriaIds: [] }, { categoriaIds: [categoryId, categoryId] }, { categoriaIds: null }, { precio: 0 }]) {
      await api().post('/productos').set(auth(adminToken)).send({ ...valid, ...invalid }).expect(400);
    }
    const response = await api().post('/productos').set(auth(adminToken)).send(valid).expect(201);
    const [linked] = await db.query('SELECT COUNT(*)::int AS count FROM categoria_producto WHERE producto_id=$1', [response.body.productoId]);
    const [images] = await db.query('SELECT COUNT(*)::int AS count FROM producto_imagen WHERE producto_id=$1', [response.body.productoId]);
    expect(linked.count).toBe(1); expect(images.count).toBe(0);
    expect(await balance(response.body.productoId as number)).toBe(3);
    await api().put(`/productos/${response.body.productoId}`).set(auth(adminToken)).send({ precio: 0 }).expect(400);
    await api().put(`/productos/${response.body.productoId}`).set(auth(adminToken)).send({ proveedorId: null }).expect(400);
  });
  it('rejects missing, forged and oversized product images without external uploads', async () => {
    const p = await product();
    await api().post('/producto-imagenes').set(auth(adminToken)).field('productoId', p.productoId).expect(400);
    await api().post('/producto-imagenes').set(auth(adminToken)).field('productoId', p.productoId).attach('imagen', Buffer.from('fake PNG'), { filename: 'fake.png', contentType: 'image/png' }).expect(400);
    await api().post('/producto-imagenes').set(auth(adminToken)).field('productoId', p.productoId).attach('imagen', Buffer.alloc(5 * 1024 * 1024 + 1), { filename: 'large.png', contentType: 'image/png' }).expect(413);
  });
  it('rolls back product, stock and audit when categories are invalid', async () => {
    const nombre = `Categoría inválida ${++sequence}`;
    await api().post('/productos').set(auth(adminToken)).send({ nombre, cantidad: 9, precio: 10, proveedorId: supplierId, categoriaIds: [2147483647] }).expect(400);
    expect((await db.query('SELECT 1 FROM producto WHERE nombre=$1', [nombre])).length).toBe(0);
    const p = await product(5);
    await api().put(`/productos/${p.productoId}`).set(auth(adminToken)).send({ cantidad: 2, categoriaIds: [2147483647] }).expect(400);
    expect(await balance(p.productoId)).toBe(5);
    expect((await db.query('SELECT 1 FROM ajuste_inventario WHERE producto_id=$1', [p.productoId])).length).toBe(0);
    expect((await db.query('SELECT categoria_id FROM categoria_producto WHERE producto_id=$1', [p.productoId]))[0].categoria_id).toBe(categoryId);
  });
  it('protects the last administrator through account and legacy role endpoints', async () => {
    await api().put(`/usuarios/${adminId}`).set(auth(adminToken)).send({ roles: ['EMPLOYEE'] }).expect(409);
    await api().put(`/usuarios/${adminId}`).set(auth(adminToken)).send({ isActive: false }).expect(409);
    await api().delete(`/usuarios/${adminId}`).set(auth(adminToken)).expect(409);
    await api().put(`/usuarios/${adminId}`).set(auth(adminToken)).send({ isActive: 'false' }).expect(400);
    const [assignment] = await db.query(`SELECT ur.usuario_rol_id,r.rol_id FROM usuario_rol ur CROSS JOIN rol r WHERE ur.usuario_id=$1 AND r.nombre='EMPLOYEE'`, [adminId]);
    await api().put(`/usuario-roles/${assignment.usuario_rol_id}`).set(auth(adminToken)).send({ rolId: assignment.rol_id }).expect(409);
    await api().delete(`/usuario-roles/${assignment.usuario_rol_id}`).set(auth(adminToken)).expect(409);
    await api().get('/usuarios').set(auth(adminToken)).expect(200);
  });
  it('creates, edits and filters accounts without exposing passwords and applies access changes immediately', async () => {
    const username = `managed_${++sequence}`;
    const created = await api().post('/usuarios').set(auth(adminToken)).send({ username, password, roles: ['EMPLOYEE'], email: 'managed@example.test' }).expect(201);
    const id = created.body.usuarioId;
    expect(created.body.password).toBeUndefined(); expect(created.body.roles).toEqual(['EMPLOYEE']);
    let login = await api().post('/auth/login').send({ username, password }).expect(201);
    const oldToken = login.body.accessToken as string;
    await api().get('/usuarios').set(auth(oldToken)).expect(403);
    await api().get('/inventory/adjustments').set(auth(oldToken)).expect(200);
    const changed = await api().put(`/usuarios/${id}`).set(auth(adminToken)).send({ password: 'ChangedIntegration123!', email: null, primerNombre: 'Editado', roles: ['CUSTOMER'], documento: `MANAGED-${sequence}` }).expect(200);
    expect(changed.body.password).toBeUndefined(); expect(changed.body.email).toBeNull();
    const [stored] = await db.query('SELECT password FROM usuario WHERE usuario_id=$1', [id]);
    expect(await bcrypt.compare('ChangedIntegration123!', stored.password as string)).toBe(true);
    await api().post('/auth/login').send({ username, password }).expect(401);
    login = await api().post('/auth/login').send({ username, password: 'ChangedIntegration123!' }).expect(201);
    await api().get('/inventory/adjustments').set(auth(oldToken)).expect(403);
    await api().get('/carritos/me').set(auth(login.body.accessToken as string)).expect(200);
    await api().put(`/usuarios/${id}`).set(auth(adminToken)).send({ isActive: false }).expect(200);
    await api().get('/carritos/me').set(auth(login.body.accessToken as string)).expect(401);
    const filtered = await api().get('/usuarios').query({ username, isActive: false }).set(auth(adminToken)).expect(200);
    expect(filtered.body.data.map((user: { usuarioId: number }) => user.usuarioId)).toEqual([id]);
    expect(filtered.body.data[0].password).toBeUndefined();
    await api().get('/usuarios').query({ username, isActive: true }).set(auth(adminToken)).expect(200).expect((result) => expect(result.body.total).toBe(0));
    await api().put(`/usuarios/${id}`).set(auth(adminToken)).send({ isActive: true }).expect(200);
    await api().get(`/usuarios/${id}`).set(auth(adminToken)).expect(200).expect((result) => expect(result.body.password).toBeUndefined());
  });
  it('rejects invalid account access atomically and denies customer administration', async () => {
    const username = `invalid_customer_${++sequence}`;
    await api().post('/usuarios').set(auth(adminToken)).send({ username, password, roles: ['CUSTOMER'] }).expect(400);
    expect((await db.query('SELECT 1 FROM usuario WHERE username=$1', [username])).length).toBe(0);
    for (const roles of [[], ['OWNER'], null]) {
      await api().post('/usuarios').set(auth(adminToken)).send({ username, password, roles }).expect(400);
    }
    await api().post('/usuarios').set(auth(adminToken)).send({ username: 123, password, roles: ['ADMIN'] }).expect(400);
    await api().get('/usuarios').query({ page: 1.5 }).set(auth(adminToken)).expect(400);
    const c = await customer();
    for (const path of ['/usuarios', '/roles', '/usuario-roles']) await api().get(path).set(auth(c.token)).expect(403);
  });
  it('serializes concurrent demotions so one active administrator always remains', async () => {
    const accounts: { id: number; token: string }[] = [];
    for (let index = 0; index < 2; index++) {
      const username = `parallel_admin_${++sequence}`;
      const created = await api().post('/usuarios').set(auth(adminToken)).send({ username, password, roles: ['ADMIN'] }).expect(201);
      const login = await api().post('/auth/login').send({ username, password }).expect(201);
      accounts.push({ id: created.body.usuarioId, token: login.body.accessToken });
    }
    try {
      await api().put(`/usuarios/${adminId}`).set(auth(accounts[0].token)).send({ isActive: false }).expect(200);
      const responses = await Promise.all(accounts.map((account) => api().put(`/usuarios/${account.id}`).set(auth(account.token)).send({ roles: ['EMPLOYEE'] })));
      expect(responses.map((response) => response.status).sort()).toEqual([200, 409]);
      const survivor = accounts[responses.findIndex((response) => response.status === 409)];
      await api().put(`/usuarios/${adminId}`).set(auth(survivor.token)).send({ isActive: true }).expect(200);
    } finally {
      // Only the isolated test fixture; restores its primary actor even on assertion failure.
      await db.query('UPDATE usuario SET is_active=true WHERE usuario_id=$1', [adminId]);
      for (const account of accounts) await api().put(`/usuarios/${account.id}`).set(auth(adminToken)).send({ isActive: false }).expect(200);
    }
  });
  it('changes employee and account state together and rolls back a forbidden administrator deactivation', async () => {
    const [employee] = await db.query(`INSERT INTO empleado(nombre,email,estado,usuario_id) VALUES('Administrador de prueba','admin-employee@example.test','ACTIVO',$1) RETURNING empleado_id`, [adminId]);
    for (const path of ['estado', 'desactivar']) {
      await api().patch(`/empleados/${employee.empleado_id}/${path}`).set(auth(adminToken)).expect(409);
      expect((await db.query('SELECT estado FROM empleado WHERE empleado_id=$1', [employee.empleado_id]))[0].estado).toBe('ACTIVO');
      expect((await db.query('SELECT is_active FROM usuario WHERE usuario_id=$1', [adminId]))[0].is_active).toBe(true);
    }
    const created = await api().post('/usuarios').set(auth(adminToken)).send({ username: `employee_state_${++sequence}`, password, roles: ['EMPLOYEE'] }).expect(201);
    const [regular] = await db.query(`INSERT INTO empleado(nombre,email,estado,usuario_id) VALUES('Empleado de prueba','state-employee@example.test','ACTIVO',$1) RETURNING empleado_id`, [created.body.usuarioId]);
    await api().patch(`/empleados/${regular.empleado_id}/desactivar`).set(auth(adminToken)).expect(200);
    expect((await db.query('SELECT is_active FROM usuario WHERE usuario_id=$1', [created.body.usuarioId]))[0].is_active).toBe(false);
    await api().patch(`/empleados/${regular.empleado_id}/activar`).set(auth(adminToken)).expect(200);
    expect((await db.query('SELECT is_active FROM usuario WHERE usuario_id=$1', [created.body.usuarioId]))[0].is_active).toBe(true);
  });
  it('creates product, permanent SKU and initial stock atomically', async () => {
    const p = await product(8);
    expect(p.productoId).toBeGreaterThan(0);
    expect(p.sku).not.toMatch(/^TMP-/);
    expect(await balance(p.productoId)).toBe(8);
  });
  it('keeps increases and reductions consistent with ledger and audit', async () => {
    const p = await product(10);
    await api().put(`/productos/${p.productoId}`).set(auth(adminToken)).send({ cantidad: 15 }).expect(200);
    expect(await balance(p.productoId)).toBe(15);
    await api().put(`/productos/${p.productoId}`).set(auth(adminToken)).send({ cantidad: 4 }).expect(200);
    expect(await balance(p.productoId)).toBe(4);
    const [audit] = await db.query('SELECT count(*)::int AS count FROM ajuste_inventario WHERE producto_id=$1', [p.productoId]);
    expect(audit.count).toBe(2);
  });
  it('updates all stock representations through the adjustments endpoint and rejects stale values', async () => {
    const p = await product(10);
    const payload = { productoId: p.productoId, stockAnterior: 10, stockNuevo: 7, cantidad: 3, motivo: 'Recuento físico' };
    await api().post('/inventory/adjustments').set(auth(adminToken)).send(payload).expect(201);
    expect(await balance(p.productoId)).toBe(7);
    await api().post('/inventory/adjustments').set(auth(adminToken)).send(payload).expect(409);
    await api().post('/inventory/adjustments').set(auth(adminToken)).send({ ...payload, stockAnterior: 7, stockNuevo: 5, cantidad: 20 }).expect(400);
    await api().get('/inventory/adjustments').set(auth(adminToken)).expect(200);
  });
  it('rolls back product edits when audit persistence fails', async () => {
    const p = await product(10);
    await expect(app.get(UpdateProductUseCase).ejecutar(p.productoId, -1, { cantidad: 5 })).rejects.toThrow();
    expect(await balance(p.productoId)).toBe(10);
  });
  it('preserves stock and audit when adjustment valuation exceeds the monetary range', async () => {
    const p = await product(0, 600000000000);
    await api().post('/inventory/adjustments').set(auth(adminToken)).send({ productoId: p.productoId, stockAnterior: 0, stockNuevo: 2, cantidad: 2, motivo: 'Importe fuera de rango' }).expect(400);
    expect(await balance(p.productoId)).toBe(0);
    const [row] = await db.query('SELECT count(*)::int AS count FROM ajuste_inventario WHERE producto_id=$1', [p.productoId]);
    expect(row.count).toBe(0);
  });
  it('records exact cents and only one concurrent manual adjustment for an expected balance', async () => {
    const p = await product(5, 0.1);
    const payload = { productoId: p.productoId, stockAnterior: 5, stockNuevo: 2, cantidad: 3, motivo: 'Baja controlada de QA' };
    const responses = await Promise.all([api().post('/inventory/adjustments').set(auth(adminToken)).send(payload), api().post('/inventory/adjustments').set(auth(adminToken)).send(payload)]);
    expect(responses.map(r => r.status).sort()).toEqual([201, 409]);
    expect(await balance(p.productoId)).toBe(2);
    const [row] = await db.query("SELECT count(*)::int AS count,sum(valor_total)::text AS total FROM kardex WHERE producto_id=$1 AND tipo_referencia='AJUSTE' AND tipo_movimiento='SALIDA'", [p.productoId]);
    expect(row).toEqual({ count: 1, total: '0.30' });
    const [audit] = await db.query('SELECT count(*)::int AS count FROM ajuste_inventario WHERE producto_id=$1', [p.productoId]);
    expect(audit.count).toBe(1);
  });
  it('rejects loose stock writes that bypass purchase reception and adjustment audit', async () => {
    const p = await product(2);
    const payload = { productoId: p.productoId, tipoMovimiento: 'SALIDA', cantidad: 1, costoUnitario: 100, valorTotal: 100, referenciaId: p.productoId, tipoReferencia: 'AJUSTE' };
    await api().post('/inventory/kardex/movements').set(auth(adminToken)).send(payload).expect(410);
    expect(await balance(p.productoId)).toBe(2);
    await api().post('/inventory/kardex/movements').set(auth(adminToken)).send({ ...payload, cantidad: 2, valorTotal: 200 }).expect(410);
    expect(await balance(p.productoId)).toBe(2);
  });
  const purchaseInput = (id: number, quantity = 2, cost = 10.15) => ({ proveedorId: supplierId, lineas: [{ productoId: id, cantidad: quantity, costoUnitario: cost }] });
  async function draftPurchase(id: number, quantity = 2, cost = 10.15) {
    return api().post('/compras').set(auth(adminToken)).send(purchaseInput(id, quantity, cost)).expect(201);
  }
  it('requires staff roles and rejects trusted actor/totals, duplicates and invalid purchase queries', async () => {
    const p = await product(1); const c = await customer(); const body = purchaseInput(p.productoId);
    await api().get('/compras').expect(401);
    await api().post('/compras').set(auth(c.token)).send(body).expect(403);
    await api().post('/compras').set(auth(adminToken)).send({ ...body, usuarioId: adminId, total: 1 }).expect(400);
    await api().post('/compras').set(auth(adminToken)).send({ ...body, lineas: [...body.lineas, ...body.lineas] }).expect(400);
    for (const query of [{ page: -1 }, { page: 1.5 }, { limit: 101 }, { estado: 'INVENTADO' }, { proveedorId: 'bad' }]) await api().get('/compras').set(auth(adminToken)).query(query).expect(400);
  });
  it('saves purchase lines and authenticated actor without changing stock and preserves version snapshots', async () => {
    const p = await product(5); const created = await draftPurchase(p.productoId, 3, 0.1); const id = created.body.compraId;
    expect(created.body).toMatchObject({ estado: 'BORRADOR', version: 1, total: 0.3, usuarioId: adminId, recibidaPor: null });
    expect(created.body.historial).toHaveLength(1); expect(created.body.lineas[0].subtotal).toBe(0.3); expect(await balance(p.productoId)).toBe(5);
    const updated = await api().put(`/compras/${id}`).set(auth(adminToken)).send({ ...purchaseInput(p.productoId, 4, 0.2), version: 1 }).expect(200);
    expect(updated.body).toMatchObject({ version: 2, total: 0.8 });
    expect(updated.body.historial.map((e: { snapshot: { total: number } }) => e.snapshot.total)).toEqual([0.3, 0.8]);
    await api().put(`/compras/${id}`).set(auth(adminToken)).send({ ...purchaseInput(p.productoId), version: 1 }).expect(409);
    await api().post(`/compras/${id}/receive`).set(auth(adminToken)).send({ version: 1 }).expect(409);
    expect(await balance(p.productoId)).toBe(5);
  });
  it('receives complete purchases once under concurrent confirmations and preserves received lines', async () => {
    const a = await product(1); const b = await product(0);
    const body = { proveedorId: supplierId, lineas: [{ productoId: b.productoId, cantidad: 3, costoUnitario: 0.1 }, { productoId: a.productoId, cantidad: 2, costoUnitario: 10 }] };
    const created = await api().post('/compras').set(auth(adminToken)).send(body).expect(201); const id = created.body.compraId;
    const receive = () => api().post(`/compras/${id}/receive`).set(auth(adminToken)).send({ version: 1 });
    const responses = await Promise.all([receive(), receive()]); expect(responses.map(r => r.status)).toEqual([200, 200]);
    expect(await balance(a.productoId)).toBe(3); expect(await balance(b.productoId)).toBe(3);
    const detail = await api().get(`/compras/${id}`).set(auth(adminToken)).expect(200);
    expect(detail.body).toMatchObject({ estado: 'RECIBIDA', version: 2, recibidaPor: adminId, total: 20.3 });
    expect(detail.body.recibidaEn).toBeTruthy(); expect(detail.body.historial).toHaveLength(2);
    expect(timestamp(detail.body.recibidaEn)).toBeGreaterThanOrEqual(timestamp(detail.body.fechaCompra));
    expect(Math.abs(timestamp(detail.body.historial[1].fecha) - timestamp(detail.body.recibidaEn))).toBeLessThan(5000);
    const [ledger] = await db.query("SELECT count(*)::int AS count,sum(cantidad)::int AS quantity,sum(valor_total)::text AS total FROM kardex WHERE tipo_referencia='RECEPCION_COMPRA' AND referencia_id=$1", [id]);
    expect(ledger).toEqual({ count: 2, quantity: 5, total: '20.30' });
    await receive().expect(200);
    await api().put(`/compras/${id}`).set(auth(adminToken)).send({ ...body, version: 2 }).expect(409);
    await api().patch(`/compras/${id}/cancel`).set(auth(adminToken)).send({ version: 2, motivo: 'No puede cancelar una recibida' }).expect(409);
    await api().delete(`/compras/${id}`).set(auth(adminToken)).expect(410);
    expect((await api().get(`/compras/${id}`).set(auth(adminToken))).body.lineas).toHaveLength(2);
  });
  it('serializes a draft edit racing with receipt without using stale quantities', async () => {
    const p = await product(0); const created = await draftPurchase(p.productoId, 1); const id = created.body.compraId;
    const results = await Promise.all([
      api().put(`/compras/${id}`).set(auth(adminToken)).send({ ...purchaseInput(p.productoId, 5), version: 1 }),
      api().post(`/compras/${id}/receive`).set(auth(adminToken)).send({ version: 1 }),
    ]);
    expect(results.map(r => r.status).sort()).toEqual([200, 409]);
    const detail = (await api().get(`/compras/${id}`).set(auth(adminToken))).body;
    expect(detail.version).toBe(2);
    expect(await balance(p.productoId)).toBe(detail.estado === 'RECIBIDA' ? 1 : 0);
    expect(detail.lineas[0].cantidad).toBe(detail.estado === 'RECIBIDA' ? 1 : 5);
  });
  it('rolls back receipt stock, ledger and state when the final event fails', async () => {
    const p = await product(1); const created = await draftPurchase(p.productoId); const id = created.body.compraId;
    await db.query("CREATE FUNCTION qa_fail_purchase_event() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.accion='RECIBIDA' THEN RAISE EXCEPTION 'QA receipt event failure'; END IF; RETURN NEW; END $$");
    await db.query('CREATE TRIGGER qa_purchase_event BEFORE INSERT ON compra_evento FOR EACH ROW EXECUTE FUNCTION qa_fail_purchase_event()');
    try { await api().post(`/compras/${id}/receive`).set(auth(adminToken)).send({ version: 1 }).expect(500); }
    finally { await db.query('DROP TRIGGER qa_purchase_event ON compra_evento'); await db.query('DROP FUNCTION qa_fail_purchase_event()'); }
    expect(await balance(p.productoId)).toBe(1);
    const detail = (await api().get(`/compras/${id}`).set(auth(adminToken))).body;
    expect(detail).toMatchObject({ estado: 'BORRADOR', version: 1, recibidaPor: null, recibidaEn: null }); expect(detail.historial).toHaveLength(1);
    const [ledger] = await db.query("SELECT count(*)::int AS count FROM kardex WHERE tipo_referencia='RECEPCION_COMPRA' AND referencia_id=$1", [id]); expect(ledger.count).toBe(0);
  });
  it('rolls back all receipt lines when a later ledger entry fails', async () => {
    const a = await product(1); const b = await product(2);
    const created = await api().post('/compras').set(auth(adminToken)).send({ proveedorId: supplierId, lineas: [{ productoId: b.productoId, cantidad: 1, costoUnitario: 1 }, { productoId: a.productoId, cantidad: 1, costoUnitario: 1 }] }).expect(201); const id = created.body.compraId;
    await db.query("CREATE FUNCTION qa_fail_second_receipt() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.tipo_referencia='RECEPCION_COMPRA' AND EXISTS(SELECT 1 FROM kardex WHERE tipo_referencia=NEW.tipo_referencia AND referencia_id=NEW.referencia_id) THEN RAISE EXCEPTION 'QA later receipt line failure'; END IF; RETURN NEW; END $$");
    await db.query('CREATE TRIGGER qa_second_receipt BEFORE INSERT ON kardex FOR EACH ROW EXECUTE FUNCTION qa_fail_second_receipt()');
    try { await api().post(`/compras/${id}/receive`).set(auth(adminToken)).send({ version: 1 }).expect(500); }
    finally { await db.query('DROP TRIGGER qa_second_receipt ON kardex'); await db.query('DROP FUNCTION qa_fail_second_receipt()'); }
    expect(await balance(a.productoId)).toBe(1); expect(await balance(b.productoId)).toBe(2);
    expect((await api().get(`/compras/${id}`).set(auth(adminToken))).body.estado).toBe('BORRADOR');
  });
  it('rejects inactive or mismatched purchase references and rechecks product state on receipt', async () => {
    const p = await product(1);
    const [supplier] = await db.query("INSERT INTO proveedor(nombre,is_active) VALUES('Otro proveedor QA',true) RETURNING proveedor_id");
    await api().post('/compras').set(auth(adminToken)).send({ ...purchaseInput(p.productoId), proveedorId: supplier.proveedor_id }).expect(400);
    const created = await draftPurchase(p.productoId); const id = created.body.compraId;
    await api().delete(`/productos/${p.productoId}`).set(auth(adminToken)).expect(200);
    await api().post(`/compras/${id}/receive`).set(auth(adminToken)).send({ version: 1 }).expect(400);
    expect(await balance(p.productoId)).toBe(1);
    const filtered = await api().get('/productos').query({ proveedorId: supplier.proveedor_id }).expect(200); expect(filtered.body.data).toHaveLength(0);
  });
  it('lets employees receive but restricts cancellation to admin and preserves cancelled history', async () => {
    const username = `purchase_employee_${++sequence}`;
    await api().post('/usuarios').set(auth(adminToken)).send({ username, password, roles: ['EMPLOYEE'] }).expect(201);
    const employee = (await api().post('/auth/login').send({ username, password }).expect(201)).body.accessToken as string;
    const p = await product(0); const created = await api().post('/compras').set(auth(employee)).send(purchaseInput(p.productoId)).expect(201); const id = created.body.compraId;
    await api().patch(`/compras/${id}/cancel`).set(auth(employee)).send({ version: 1, motivo: 'No autorizado' }).expect(403);
    await api().patch(`/compras/${id}/cancel`).set(auth(adminToken)).send({ version: 1, motivo: '   ' }).expect(400);
    const cancelled = await api().patch(`/compras/${id}/cancel`).set(auth(adminToken)).send({ version: 1, motivo: '  Duplicado de prueba  ' }).expect(200);
    expect(cancelled.body).toMatchObject({ estado: 'CANCELADA', canceladaPor: adminId, motivoCancelacion: 'Duplicado de prueba' }); expect(cancelled.body.lineas).toHaveLength(1);
    await api().post(`/compras/${id}/receive`).set(auth(employee)).send({ version: 2 }).expect(409);
    const second = await draftPurchase(p.productoId, 1); await api().post(`/compras/${second.body.compraId}/receive`).set(auth(employee)).send({ version: 1 }).expect(200);
    expect(await balance(p.productoId)).toBe(1);
    const page = await api().get('/compras').set(auth(adminToken)).query({ estado: 'CANCELADA', page: 1, limit: 1 }).expect(200); expect(page.body.data[0].estado).toBe('CANCELADA');
  });
  it('keeps legacy purchase headers read-only without inventing receipt stock', async () => {
    const p = await product(0); const [legacy] = await db.query("INSERT INTO compra(proveedor_id,usuario_id,total,estado) VALUES($1,$2,10,'LEGACY') RETURNING compra_id", [supplierId, adminId]);
    await db.query('INSERT INTO compra_detalle(compra_id,producto_id,cantidad,costo_unitario,subtotal) VALUES($1,$2,1,10,10)', [legacy.compra_id, p.productoId]);
    const detail = await api().get(`/compras/${legacy.compra_id}`).set(auth(adminToken)).expect(200); expect(detail.body.historial).toEqual([]);
    await api().post(`/compras/${legacy.compra_id}/receive`).set(auth(adminToken)).send({ version: 1 }).expect(409);
    await api().put(`/compras/${legacy.compra_id}`).set(auth(adminToken)).send({ ...purchaseInput(p.productoId), version: 1 }).expect(409);
    await api().patch(`/compras/${legacy.compra_id}/cancel`).set(auth(adminToken)).send({ version: 1, motivo: 'Histórico' }).expect(409);
    expect(await balance(p.productoId)).toBe(0);
  });
  it('serves paginated read-only Kardex with receipt references and consistent current balance', async () => {
    const p = await product(3); const created = await draftPurchase(p.productoId, 2, 0.1); const id = created.body.compraId;
    const receipt = await api().post(`/compras/${id}/receive`).set(auth(adminToken)).send({ version: 1 }).expect(200);
    await api().post('/inventory/adjustments').set(auth(adminToken)).send({ productoId: p.productoId, stockAnterior: 5, stockNuevo: 4, cantidad: 1, motivo: 'Baja auditada tras recepción' }).expect(201);
    const path = `/inventory/products/${p.productoId}/movements`;
    await api().get(path).expect(401); const c = await customer(); await api().get(path).set(auth(c.token)).expect(403);
    await api().get(path).set(auth(adminToken)).query({ page: 0 }).expect(400);
    const first = await api().get(path).set(auth(adminToken)).query({ page: 1, limit: 1 }).expect(200);
    expect(first.body).toMatchObject({ total: 3, totalPages: 3, stockActual: 4, saldoKardex: 4 }); expect(first.body.data).toHaveLength(1);
    const second = await api().get(path).set(auth(adminToken)).query({ page: 2, limit: 1 }).expect(200);
    expect(second.body.data[0]).toMatchObject({ tipoReferencia: 'RECEPCION_COMPRA', referenciaId: id, cantidad: 2, costoUnitario: 0.1, valorTotal: 0.2 });
    expect(Math.abs(timestamp(second.body.data[0].fechaMovimiento) - timestamp(receipt.body.recibidaEn))).toBeLessThan(5000);
    await api().delete(`/productos/${p.productoId}`).set(auth(adminToken)).expect(200);
    await api().get(path).set(auth(adminToken)).expect(200);
    await api().get('/inventory/products/2147483647/movements').set(auth(adminToken)).expect(404);
  });
  it('counts supplied units only from received purchases and keeps the original supplier attribution', async () => {
    const [supplier] = await db.query("INSERT INTO proveedor(nombre,is_active) VALUES('Proveedor de recepción QA',true) RETURNING proveedor_id");
    const supplierRef = supplier.proveedor_id as number; const p = await product(2);
    await api().put(`/productos/${p.productoId}`).set(auth(adminToken)).send({ proveedorId: supplierRef }).expect(200);
    const supplied = () => api().get(`/proveedores/${supplierRef}/productos-suministrados`).set(auth(adminToken));
    expect((await supplied().expect(200)).body.total).toBe(0);
    const created = await api().post('/compras').set(auth(adminToken)).send({ proveedorId: supplierRef, lineas: [{ productoId: p.productoId, cantidad: 3, costoUnitario: 1 }] }).expect(201);
    expect((await supplied()).body.total).toBe(0);
    await api().post(`/compras/${created.body.compraId}/receive`).set(auth(adminToken)).send({ version: 1 }).expect(200);
    expect((await supplied()).body.total).toBe(3);
    await api().post('/inventory/adjustments').set(auth(adminToken)).send({ productoId: p.productoId, stockAnterior: 5, stockNuevo: 7, cantidad: 2, motivo: 'Ajuste que no es una entrega de proveedor' }).expect(201);
    await api().put(`/productos/${p.productoId}`).set(auth(adminToken)).send({ proveedorId: supplierId }).expect(200);
    expect((await supplied()).body.total).toBe(3);
  });
  it('filters new adjustment instants by Bogota calendar while preserving legacy dates', async () => {
    const p = await product(1);
    const created = await api().post('/inventory/adjustments').set(auth(adminToken)).send({ productoId: p.productoId, stockAnterior: 1, stockNuevo: 2, cantidad: 1, motivo: 'Prueba de límite calendario' }).expect(201);
    await db.query("UPDATE ajuste_inventario SET fecha='1900-01-01',registrado_en='2026-11-13T04:30:00Z' WHERE ajuste_inventario_id=$1", [created.body.ajusteInventarioId]);
    const route = '/inventory/adjustments';
    const day = await api().get(route).set(auth(adminToken)).query({ productoId: p.productoId, startDate: '2026-11-12', endDate: '2026-11-12' }).expect(200);
    expect(day.body.total).toBe(1); expect(timestamp(day.body.data[0].fecha)).toBe(Date.parse('2026-11-13T04:30:00Z'));
    const other = await api().get(route).set(auth(adminToken)).query({ productoId: p.productoId, startDate: '2026-11-13', endDate: '2026-11-13' }).expect(200); expect(other.body.total).toBe(0);
    await api().get(route).set(auth(adminToken)).query({ startDate: '2026-02-30' }).expect(400);
    await api().get(route).set(auth(adminToken)).query({ startDate: '2026-11-13', endDate: '2026-11-12' }).expect(400);
  });
  it('paginates raw adjustment rows without repeating records across pages', async () => {
    const p = await product(1);
    for (let stock = 1; stock < 4; stock++) {
      await api().post('/inventory/adjustments').set(auth(adminToken)).send({ productoId: p.productoId, stockAnterior: stock, stockNuevo: stock + 1, cantidad: 1, motivo: 'Paginación de auditoría' }).expect(201);
    }
    const ids: number[] = [];
    for (let page = 1; page <= 3; page++) {
      const result = await api().get('/inventory/adjustments').set(auth(adminToken)).query({ productoId: p.productoId, limit: 1, page }).expect(200);
      expect(result.body.total).toBe(3); expect(result.body.data).toHaveLength(1);
      ids.push(result.body.data[0].ajusteInventarioId as number);
    }
    expect(new Set(ids).size).toBe(3);
  });
  async function workflowOrder() {
    const p=await product(5,1.25),c=await customer();await add(c,p.productoId,2);
    const result=await checkout(c).expect(201);
    const view=await api().get(`/pedidos/${result.body.pedidoId}`).set(auth(adminToken)).expect(200);
    return {p,c,id:view.body.pedidoId as number,paymentId:view.body.pago.pagoId as number};
  }
  const orderAction=(id:number,action:string,version:number,extra:Record<string,unknown>={},token=adminToken)=>api().post(`/pedidos/${id}/actions/${action}`).set(auth(token)).send({version,motivo:`QA ${action}`,...extra});
  it('creates a versioned order with an atomic creation snapshot and retires loose writes',async()=>{
    const o=await workflowOrder();const detail=await api().get(`/pedidos/${o.id}`).set(auth(adminToken)).expect(200);
    expect(detail.body.version).toBe(1);expect(detail.body.historial).toHaveLength(1);expect(detail.body.historial[0].usuarioId).toBe(o.c.userId);
    expect(detail.body.historial[0].snapshot.total).toBe(2.5);
    await api().post('/pedidos').set(auth(adminToken)).send({total:1}).expect(410);
    await api().put(`/pedidos/${o.id}`).set(auth(adminToken)).send({total:1}).expect(410);
    await api().delete(`/pedidos/${o.id}`).set(auth(adminToken)).expect(410);
    await api().post('/pedido-detalles').set(auth(adminToken)).send({}).expect(410);
    await api().put(`/pedido-detalles/${detail.body.detalles[0].pedidoDetalleId}`).set(auth(adminToken)).send({cantidad:99}).expect(410);
    await api().delete(`/pedido-detalles/${detail.body.detalles[0].pedidoDetalleId}`).set(auth(adminToken)).expect(410);
    await api().post('/pagos').set(auth(adminToken)).send({}).expect(410);
    await api().put(`/pagos/${o.paymentId}`).set(auth(adminToken)).send({monto:1}).expect(410);
    await api().delete(`/pagos/${o.paymentId}`).set(auth(adminToken)).expect(410);
    await api().post(`/pagos/${o.paymentId}/confirm`).set(auth(adminToken)).expect(410);
    await orderAction(o.id,'APROBAR_PAGO',1,{pagoId:o.paymentId,monto:0}).expect(400);
    await orderAction(o.id,'APROBAR_PAGO',1,{pagoId:o.paymentId,usuarioId:adminId}).expect(400);
    for(const query of [{page:1.5},{estado:'INVALIDO'},{clienteId:-1},{limit:101}]) await api().get('/pedidos').set(auth(adminToken)).query(query).expect(400);
    expect(await balance(o.p.productoId)).toBe(3);
  });
  it('separates approval from delivery and restricts financial actions to ADMIN',async()=>{
    const o=await workflowOrder();const employee=await api().post('/usuarios').set(auth(adminToken)).send({username:`order_employee_${++sequence}`,password,roles:['EMPLOYEE']}).expect(201);
    const login=await api().post('/auth/login').send({username:employee.body.username,password}).expect(201);const token=login.body.accessToken as string;
    await orderAction(o.id,'ENVIAR',1).expect(409);await orderAction(o.id,'ENTREGAR',1).expect(409);
    await orderAction(o.id,'APROBAR_PAGO',1,{pagoId:o.paymentId},token).expect(403);
    const paid=await orderAction(o.id,'APROBAR_PAGO',1,{pagoId:o.paymentId}).expect(200);
    expect(paid.body.estado).toBe('CONFIRMADO');expect(paid.body.pago.estado).toBe('APROBADO');
    await orderAction(o.id,'DEVOLVER',2).expect(409);await orderAction(o.id,'ENVIAR',2,{},token).expect(200);
    await orderAction(o.id,'CANCELAR',3).expect(409);await orderAction(o.id,'ENTREGAR',3,{},token).expect(200);
    await orderAction(o.id,'DEVOLVER',4,{},token).expect(403);
    expect(await balance(o.p.productoId)).toBe(3);
  });
  it('preserves rejected attempts and only approves the current full amount',async()=>{
    const o=await workflowOrder();await orderAction(o.id,'RECHAZAR_PAGO',1,{pagoId:o.paymentId}).expect(200);
    expect(await balance(o.p.productoId)).toBe(3);await orderAction(o.id,'ENVIAR',2).expect(409);
    const retry=await orderAction(o.id,'REINTENTAR_PAGO',2).expect(200);expect(retry.body.pagos).toHaveLength(2);
    expect(retry.body.pagos[1].estado).toBe('RECHAZADO');expect(retry.body.pago.monto).toBe(2.5);
    await orderAction(o.id,'APROBAR_PAGO',3,{pagoId:o.paymentId}).expect(409);
    const paid=await orderAction(o.id,'APROBAR_PAGO',3,{pagoId:retry.body.pago.pagoId}).expect(200);
    expect(paid.body.pagos.filter((p:{estado:string})=>p.estado==='APROBADO')).toHaveLength(1);
  });
  it('cancels an owned order once concurrently and never exposes another customer order',async()=>{
    const o=await workflowOrder(),other=await customer();const route=`/pedidos/me/${o.id}/cancel`;
    await api().get(`/pedidos/me/${o.id}`).set(auth(other.token)).expect(404);
    await api().post(route).set(auth(other.token)).send({version:1,motivo:'QA cliente ajeno'}).expect(404);
    await api().post(route).set(auth(o.c.token)).send({version:1,motivo:'  '}).expect(400);
    await api().delete(`/productos/${o.p.productoId}`).set(auth(adminToken)).expect(200);
    const call=()=>api().post(route).set(auth(o.c.token)).send({version:1,motivo:'QA cancelación propia'});
    const responses=await Promise.all([call(),call()]);expect(responses.map(r=>r.status)).toEqual([200,200]);
    expect(responses[0].body.estado).toBe('CANCELADO');expect(responses[0].body.pago.estado).toBe('ANULADO');expect(responses[0].body.reembolso).toBeNull();
    expect(responses[0].body.historial).toHaveLength(2);expect(await balance(o.p.productoId)).toBe(5);
  });
  it('keeps paid cancellation and refund as distinct idempotent audited operations',async()=>{
    const o=await workflowOrder();await orderAction(o.id,'APROBAR_PAGO',1,{pagoId:o.paymentId}).expect(200);
    const cancelled=await orderAction(o.id,'CANCELAR',2).expect(200);expect(cancelled.body.reembolso.estado).toBe('PENDIENTE');expect(cancelled.body.pago.estado).toBe('APROBADO');
    expect(await balance(o.p.productoId)).toBe(5);
    const refunds=await Promise.all([orderAction(o.id,'REGISTRAR_REEMBOLSO',3),orderAction(o.id,'REGISTRAR_REEMBOLSO',3)]);
    expect(refunds.map(r=>r.status)).toEqual([200,200]);expect(refunds[0].body.reembolso.monto).toBe(2.5);expect(refunds[0].body.historial).toHaveLength(4);
    await orderAction(o.id,'CANCELAR',2).expect(200);await orderAction(o.id,'ENVIAR',4).expect(409);
    expect(await balance(o.p.productoId)).toBe(5);
  });
  it('receives complete returns once and retains original sale and refund evidence',async()=>{
    const o=await workflowOrder();await orderAction(o.id,'APROBAR_PAGO',1,{pagoId:o.paymentId}).expect(200);await orderAction(o.id,'ENVIAR',2).expect(200);await orderAction(o.id,'ENTREGAR',3).expect(200);
    const results=await Promise.all([orderAction(o.id,'DEVOLVER',4),orderAction(o.id,'DEVOLVER',4)]);expect(results.map(r=>r.status)).toEqual([200,200]);
    expect(results[0].body.estado).toBe('DEVUELTO');expect(results[0].body.reembolso.estado).toBe('PENDIENTE');expect(await balance(o.p.productoId)).toBe(5);
    const moves=await db.query("SELECT tipo_referencia,SUM(cantidad)::int AS qty FROM kardex WHERE producto_id=$1 AND tipo_referencia IN ('VENTA','DEVOLUCION_PEDIDO') GROUP BY tipo_referencia",[o.p.productoId]);
    expect(moves).toEqual(expect.arrayContaining([{tipo_referencia:'VENTA',qty:2},{tipo_referencia:'DEVOLUCION_PEDIDO',qty:2}]));
    await orderAction(o.id,'REGISTRAR_REEMBOLSO',5).expect(200);
  });
  it('serializes shipping versus cancellation without a partial stock effect',async()=>{
    const o=await workflowOrder();await orderAction(o.id,'APROBAR_PAGO',1,{pagoId:o.paymentId}).expect(200);
    const results=await Promise.all([orderAction(o.id,'ENVIAR',2),orderAction(o.id,'CANCELAR',2)]);expect(results.map(r=>r.status).sort()).toEqual([200,409]);
    const view=await api().get(`/pedidos/${o.id}`).set(auth(adminToken)).expect(200);expect(await balance(o.p.productoId)).toBe(view.body.estado==='CANCELADO'?5:3);
  });
  it('rolls back cancellation, payment, refund and stock when the final event fails',async()=>{
    const o=await workflowOrder();await orderAction(o.id,'APROBAR_PAGO',1,{pagoId:o.paymentId}).expect(200);
    await db.query(`CREATE FUNCTION qa_order_event_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.pedido_id=${o.id} AND NEW.accion='CANCELAR' THEN RAISE EXCEPTION 'QA final event'; END IF; RETURN NEW; END $$`);
    await db.query('CREATE TRIGGER qa_order_event_failure BEFORE INSERT ON pedido_evento FOR EACH ROW EXECUTE FUNCTION qa_order_event_failure()');
    try {await orderAction(o.id,'CANCELAR',2).expect(500);} finally {await db.query('DROP TRIGGER qa_order_event_failure ON pedido_evento');await db.query('DROP FUNCTION qa_order_event_failure()');}
    const view=await api().get(`/pedidos/${o.id}`).set(auth(adminToken)).expect(200);expect(view.body.estado).toBe('CONFIRMADO');expect(view.body.version).toBe(2);expect(view.body.reembolso).toBeNull();expect(view.body.historial).toHaveLength(2);expect(await balance(o.p.productoId)).toBe(3);
  });
  it('rolls back payment approval when its audit event fails',async()=>{
    const o=await workflowOrder();
    await db.query(`CREATE FUNCTION qa_payment_event_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.pedido_id=${o.id} AND NEW.accion='APROBAR_PAGO' THEN RAISE EXCEPTION 'QA payment event'; END IF; RETURN NEW; END $$`);
    await db.query('CREATE TRIGGER qa_payment_event_failure BEFORE INSERT ON pedido_evento FOR EACH ROW EXECUTE FUNCTION qa_payment_event_failure()');
    try{await orderAction(o.id,'APROBAR_PAGO',1,{pagoId:o.paymentId}).expect(500);}finally{await db.query('DROP TRIGGER qa_payment_event_failure ON pedido_evento');await db.query('DROP FUNCTION qa_payment_event_failure()');}
    const view=await api().get(`/pedidos/${o.id}`).set(auth(adminToken)).expect(200);expect(view.body.version).toBe(1);expect(view.body.pago.estado).toBe('PENDIENTE');expect(view.body.historial).toHaveLength(1);expect(await balance(o.p.productoId)).toBe(3);
  });
  it('rolls back checkout when its creation event cannot be saved',async()=>{
    const p=await product(5),c=await customer();await add(c,p.productoId,2);
    await db.query(`CREATE FUNCTION qa_checkout_event_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.accion='CREADO' AND EXISTS(SELECT 1 FROM pedido WHERE pedido_id=NEW.pedido_id AND cliente_id=${c.clientId}) THEN RAISE EXCEPTION 'QA checkout event'; END IF; RETURN NEW; END $$`);
    await db.query('CREATE TRIGGER qa_checkout_event_failure BEFORE INSERT ON pedido_evento FOR EACH ROW EXECUTE FUNCTION qa_checkout_event_failure()');
    try{await checkout(c).expect(500);}finally{await db.query('DROP TRIGGER qa_checkout_event_failure ON pedido_evento');await db.query('DROP FUNCTION qa_checkout_event_failure()');}
    expect(await balance(p.productoId)).toBe(5);expect((await api().get('/carritos/me').set(auth(c.token)).expect(200)).body.items).toHaveLength(1);
    expect(await db.query('SELECT pedido_id FROM pedido WHERE cliente_id=$1',[c.clientId])).toHaveLength(0);
  });
  it('rolls back a second restitution line and a later refund event',async()=>{
    const first=await product(5),second=await product(5),c=await customer();await add(c,first.productoId);await add(c,second.productoId);
    const result=await checkout(c).expect(201),id=result.body.pedidoId as number;
    const view=await api().get(`/pedidos/${id}`).set(auth(adminToken)).expect(200);
    await orderAction(id,'APROBAR_PAGO',1,{pagoId:view.body.pago.pagoId}).expect(200);
    await db.query(`CREATE FUNCTION qa_restore_line_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.tipo_referencia='CANCELACION_PEDIDO' AND NEW.producto_id=${second.productoId} THEN RAISE EXCEPTION 'QA restitution line'; END IF; RETURN NEW; END $$`);
    await db.query('CREATE TRIGGER qa_restore_line_failure BEFORE INSERT ON kardex FOR EACH ROW EXECUTE FUNCTION qa_restore_line_failure()');
    try{await orderAction(id,'CANCELAR',2).expect(500);}finally{await db.query('DROP TRIGGER qa_restore_line_failure ON kardex');await db.query('DROP FUNCTION qa_restore_line_failure()');}
    expect(await balance(first.productoId)).toBe(4);expect(await balance(second.productoId)).toBe(4);
    await orderAction(id,'CANCELAR',2).expect(200);
    await db.query(`CREATE FUNCTION qa_refund_event_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.pedido_id=${id} AND NEW.accion='REGISTRAR_REEMBOLSO' THEN RAISE EXCEPTION 'QA refund event'; END IF; RETURN NEW; END $$`);
    await db.query('CREATE TRIGGER qa_refund_event_failure BEFORE INSERT ON pedido_evento FOR EACH ROW EXECUTE FUNCTION qa_refund_event_failure()');
    try{await orderAction(id,'REGISTRAR_REEMBOLSO',3).expect(500);}finally{await db.query('DROP TRIGGER qa_refund_event_failure ON pedido_evento');await db.query('DROP FUNCTION qa_refund_event_failure()');}
    const after=await api().get(`/pedidos/${id}`).set(auth(adminToken)).expect(200);expect(after.body.version).toBe(3);expect(after.body.reembolso.estado).toBe('PENDIENTE');expect(await balance(first.productoId)).toBe(5);
  });
  it('reports gross decisions and separate pending/registered refunds on their own calendar',async()=>{
    const date=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const report=()=>api().get('/admin/reports').set(auth(adminToken)).query({dateFrom:date,dateTo:date});
    const before=await report().expect(200),o=await workflowOrder();await orderAction(o.id,'APROBAR_PAGO',1,{pagoId:o.paymentId}).expect(200);
    await db.query("UPDATE pago SET fecha_pago='1900-01-01',registrado_en='1900-01-01T00:00:00Z' WHERE pago_id=$1",[o.paymentId]);
    await orderAction(o.id,'CANCELAR',2).expect(200);
    const pending=await report().expect(200);expect(pending.body.refunds.pending-before.body.refunds.pending).toBe(2.5);expect(pending.body.summary.approvedPayments-before.body.summary.approvedPayments).toBe(2.5);
    await orderAction(o.id,'REGISTRAR_REEMBOLSO',3).expect(200);
    const registered=await report().expect(200);expect(registered.body.refunds.pending).toBe(before.body.refunds.pending);expect(registered.body.refunds.registered-before.body.refunds.registered).toBe(2.5);expect(registered.body.summary.approvedPayments).toBe(pending.body.summary.approvedPayments);
  });
  it('preserves pre-workflow orders without inventing stock restitution',async()=>{
    const c=await customer();const [legacy]=await db.query("INSERT INTO pedido(cliente_id,direccion_id,estado,total,numero_pedido_usuario) VALUES($1,$2,'CONFIRMADO',9,1) RETURNING pedido_id",[c.clientId,c.addressId]);
    const view=await api().get(`/pedidos/${legacy.pedido_id}`).set(auth(adminToken)).expect(200);expect(view.body.version).toBe(0);expect(view.body.historial).toEqual([]);
    await orderAction(legacy.pedido_id as number,'CANCELAR',1).expect(409);
  });
  it('allows only one of two customers to buy the final unit', async () => {
    const p = await product(1); const first = await customer(); const second = await customer();
    await add(first, p.productoId); await add(second, p.productoId);
    const responses = await Promise.all([checkout(first), checkout(second)]);
    expect(responses.map((r) => r.status).sort()).toEqual([201, 409]);
    expect(await balance(p.productoId)).toBe(0);
  });
  it('prevents duplicate checkout of one cart', async () => {
    const p = await product(5); const c = await customer(); await add(c, p.productoId);
    const responses = await Promise.all([checkout(c), checkout(c)]);
    expect(responses.map((r) => r.status).sort()).toEqual([201, 409]);
    expect(await balance(p.productoId)).toBe(4);
  });
  it('allocates unique order numbers for concurrent carts of one customer', async () => {
    const p = await product(5); const c = await customer();
    const carts: { carrito_id: number }[] = [];
    for (let i = 0; i < 2; i++) {
      const [cart] = await db.query<{ carrito_id: number }[]>('INSERT INTO carrito(usuario_id) VALUES($1) RETURNING carrito_id', [c.userId]);
      carts.push(cart);
      await db.query('INSERT INTO carrito_detalle(carrito_id,producto_id,cantidad) VALUES($1,$2,1)', [cart.carrito_id, p.productoId]);
    }
    const validations = await Promise.all(carts.map((cart) => app.get(ValidateCartStockUseCase).ejecutar(cart.carrito_id)));
    const orders = await Promise.all(validations.map((v) => app.get(CreateOrderUseCase).ejecutar({ clienteId: c.clientId, carritoId: v.carritoId, direccionId: c.addressId, metodoPago: MetodoPagoEnum.EFECTIVO, total: v.total, items: v.items })));
    expect(orders.map((o) => o.numeroPedidoUsuario).sort()).toEqual([1, 2]);
    expect(await balance(p.productoId)).toBe(3);
  });
  it('stores totals above the old numeric(10,2) limit', async () => {
    const p = await product(3, 60000000); const c = await customer(); await add(c, p.productoId, 2);
    const response = await checkout(c).expect(201);
    expect(response.body.total).toBe(120000000);
    expect(await balance(p.productoId)).toBe(1);
  });
  it('uses cents to calculate fractional prices', async () => {
    const p = await product(3, 0.1); const c = await customer(); await add(c, p.productoId, 3);
    const response = await checkout(c).expect(201);
    expect(response.body.total).toBe(0.3);
  });
  it('rolls back order, ledger, stock and cart when a later write fails', async () => {
    const p = await product(5); const c = await customer(); const cart = await add(c, p.productoId);
    const v = await app.get(ValidateCartStockUseCase).ejecutar((cart.body as { carritoId: number }).carritoId);
    await expect(app.get(CreateOrderUseCase).ejecutar({ clienteId: c.clientId, carritoId: v.carritoId, direccionId: c.addressId, metodoPago: 'INVALID' as MetodoPagoEnum, total: v.total, items: v.items })).rejects.toThrow();
    expect(await balance(p.productoId)).toBe(5);
    expect((await api().get('/carritos/me').set(auth(c.token)).expect(200)).body.items).toHaveLength(1);
    expect((await db.query('SELECT pedido_id FROM pedido WHERE cliente_id=$1', [c.clientId]))).toHaveLength(0);
  });
  it('rejects a different customer delivery address', async () => {
    const p = await product(); const first = await customer(); const second = await customer(); await add(first, p.productoId);
    await checkout({ ...first, addressId: second.addressId }).expect(409);
    expect(await balance(p.productoId)).toBe(10);
  });
  it('supports login, HttpOnly refresh cookie and logout clearing', async () => {
    await api().post('/auth/login').send({ username: 'integration_admin', password: 'WrongPassword123!' }).expect(401);
    const login = await api().post('/auth/login').send({ username: 'integration_admin', password }).expect(201);
    const cookies = login.headers['set-cookie'] as unknown as string[];
    expect(cookies[0]).toContain('HttpOnly'); expect(cookies[0]).toContain('Path=/auth/refresh');
    const refreshed = await api().post('/auth/refresh').set('Cookie', cookies[0].split(';')[0]).expect(201);
    expect(refreshed.body.accessToken).toBeTruthy();
    const logout = await api().post('/auth/logout').expect(201);
    expect(String(logout.headers['set-cookie'])).toContain('Expires=Thu, 01 Jan 1970');
  });
  it('serves dashboard and adjustments with real database queries', async () => {
    await api().get('/admin/dashboard').set(auth(adminToken)).expect(200);
    await api().get('/inventory/adjustments').set(auth(adminToken)).expect(200);
  });
  it('uses recorded movement instants for dashboard activity and calendar aggregates', async () => {
    const route = '/admin/dashboard';
    const before = await api().get(route).set(auth(adminToken)).expect(200);
    const p = await product(7);
    const instant = new Date(Date.now() + 60000).toISOString();
    const [movement] = await db.query("WITH changed AS (UPDATE kardex SET fecha_movimiento='1900-01-01',registrado_en=$1 WHERE producto_id=$2 RETURNING kardex_id) SELECT kardex_id FROM changed", [instant, p.productoId]);
    const result = await api().get(route).set(auth(adminToken)).expect(200);
    const activity = result.body.recentActivity as { movementId: number; date: string }[];
    expect(activity.find(row => row.movementId === movement.kardex_id)?.date).toBe(instant);
    const [period] = await db.query("SELECT TO_CHAR($1::timestamptz AT TIME ZONE 'America/Bogota','YYYY-MM') AS value", [instant]);
    const rows = (body: { inventoryMovements: { period: string; entradas: number }[] }) => body.inventoryMovements.find(row => row.period === period.value)?.entradas ?? 0;
    expect(rows(result.body as Parameters<typeof rows>[0]) - rows(before.body as Parameters<typeof rows>[0])).toBe(7);
  });
  it('soft-deletes a product without removing inventory history', async () => {
    const p = await product(2);
    await api().delete(`/productos/${p.productoId}`).set(auth(adminToken)).expect(200);
    expect((await db.query('SELECT is_active FROM producto WHERE producto_id=$1', [p.productoId]))[0].is_active).toBe(false);
    expect(await balance(p.productoId)).toBe(2);
  });
  it('restricts address edits to their owner and preserves addresses used by orders', async () => {
    const first = await customer(); const second = await customer(); const p = await product();
    await api().put(`/direcciones/${first.addressId}`).set(auth(second.token)).send({ barrio: 'Otro' }).expect(403);
    await api().delete(`/direcciones/${first.addressId}`).set(auth(second.token)).expect(403);
    await api().put(`/direcciones/${first.addressId}`).set(auth(first.token)).send({ barrio: 'Nuevo barrio' }).expect(200);
    await add(first, p.productoId); await checkout(first).expect(201);
    await api().delete(`/direcciones/${first.addressId}`).set(auth(first.token)).expect(200);
    expect((await db.query('SELECT estado FROM direccion WHERE direccion_id=$1', [first.addressId]))[0].estado).toBe(false);
    await add(first, p.productoId); await checkout(first).expect(404);
  });
  it('enforces CORS origins and supports credentialed local requests', async () => {
    const allowed = await api().get('/productos').set('Origin', 'http://localhost:5173').expect(200);
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(allowed.headers['access-control-allow-credentials']).toBe('true');
    const denied = await api().get('/productos').set('Origin', 'https://forbidden.invalid').expect(200);
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });
});
