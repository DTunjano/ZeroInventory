import { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import { Test } from '@nestjs/testing';
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
  let sequence = 0;
  const password = 'Integration123!';
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
    const result = await api().post('/productos').set(auth(adminToken)).send({ nombre: `Producto prueba ${++sequence}`, cantidad: stock, precio: price }).expect(201);
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
    expect((await db.query(`SELECT tablename FROM pg_tables WHERE schemaname='public'`)).length).toBe(22);
  });
  it('allows public catalogues and blocks unauthenticated private data', async () => {
    await api().get('/productos').expect(200);
    await api().get('/roles').expect(401);
    await api().get('/carritos').expect(401);
    await api().get('/direcciones').expect(401);
  });
  it('registers distinct customers and enforces their role', async () => {
    const first = await customer(); const second = await customer();
    expect(first.userId).not.toBe(second.userId);
    expect(first.userId).toBeGreaterThan(0);
    await api().post('/productos').set(auth(first.token)).send({ nombre: 'No autorizado', cantidad: 1, precio: 1 }).expect(403);
    await api().get('/settings/appearance').set(auth(first.token)).expect(200);
  });
  it('validates DTOs, fractional stock, negative prices and extra fields', async () => {
    for (const payload of [{ cantidad: 1.5, precio: 10 }, { cantidad: 1, precio: -1 }, { cantidad: 1, precio: 10, extra: true }]) {
      await api().post('/productos').set(auth(adminToken)).send({ nombre: 'Inválido', ...payload }).expect(400);
    }
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
  it('applies stock movements atomically and prevents overdraw', async () => {
    const p = await product(2);
    const payload = { productoId: p.productoId, tipoMovimiento: 'SALIDA', cantidad: 1, costoUnitario: 100, valorTotal: 100, referenciaId: p.productoId, tipoReferencia: 'AJUSTE' };
    await api().post('/inventory/kardex/movements').set(auth(adminToken)).send(payload).expect(201);
    expect(await balance(p.productoId)).toBe(1);
    await api().post('/inventory/kardex/movements').set(auth(adminToken)).send({ ...payload, cantidad: 2, valorTotal: 200 }).expect(400);
    expect(await balance(p.productoId)).toBe(1);
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
