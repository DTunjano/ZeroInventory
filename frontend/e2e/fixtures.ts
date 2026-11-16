import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test'
import { randomBytes } from 'node:crypto'
import type { Order, OrderAction } from '../src/modules/orders/domain/orders.models'

type Login = { accessToken: string; user: { usuarioId: number } }
type Product = { productoId: number; nombre: string; cantidad: number }
type Scenario = {
  username: string; customerToken: string; addressId: number
  supplierId: number; product: Product
  order: () => Promise<Order>
}
export class Api {
  constructor(readonly context: APIRequestContext) {}
  async call<T>(method: string, path: string, data?: unknown, token?: string): Promise<T> {
    const response = await this.context.fetch(path, {
      method, ...(data === undefined ? {} : { data }),
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    })
    expect(response.ok(), `${method} ${path}: HTTP ${response.status()}`).toBe(true)
    return await response.json() as T
  }
}
export const password = () => {
  if (!process.env.E2E_PASSWORD) throw Error('Falta la contraseña ficticia de la ejecución aislada')
  return process.env.E2E_PASSWORD
}
export async function login(page: Page, username: string) {
  await page.goto('/login')
  await page.getByLabel('Correo o usuario', { exact: true }).fill(username)
  await page.getByLabel('Contraseña', { exact: true }).fill(password())
  const accepted = page.waitForResponse(response => response.url().endsWith('/auth/login') && response.status() === 201)
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click()
  await accepted
  await expect(page).toHaveURL(/\/home$/)
}
export async function operate(page: Page, label: string, reason: string, acknowledge = false) {
  await page.getByRole('button', { name: label, exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Motivo o referencia de la operación', { exact: true }).fill(reason)
  if (acknowledge) await dialog.getByRole('checkbox').check()
  await dialog.getByRole('button', { name: 'Aplicar operación', exact: true }).click()
  await expect(dialog).toBeHidden()
}
export async function action(api: Api, order: Order, value: OrderAction, token: string) {
  return api.call<Order>('POST', `/pedidos/${order.pedidoId}/actions/${value}`, {
    version: order.version, motivo: `Preparación ficticia ${value}`,
    ...(['APROBAR_PAGO', 'RECHAZAR_PAGO'].includes(value) ? { pagoId: order.pago?.pagoId } : {}),
  }, token)
}

export const test = base.extend<{
  api: Api
  staff: { adminToken: string; employeeToken: string }
  scenario: Scenario
  localNetwork: void
  browserErrors: void
}>({
  browserErrors: [async ({ page }, provide) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await provide()
    expect(errors, 'Excepciones sin controlar en la interfaz').toEqual([])
  }, { auto: true }],
  localNetwork: [async ({ context, baseURL }, provide) => {
    const origins = [new URL(baseURL!).origin, new URL(process.env.E2E_API_URL!).origin]
    await context.route('**/*', async route => {
      if (origins.includes(new URL(route.request().url()).origin)) await route.continue()
      else await route.abort('blockedbyclient')
    })
    await provide()
  }, { auto: true }],
  api: async ({ playwright }, provide) => {
    const context = await playwright.request.newContext({ baseURL: process.env.E2E_API_URL! })
    try { await provide(new Api(context)) }
    finally { await context.dispose() }
  },
  staff: async ({ api }, provide) => {
    const admin = await api.call<Login>('POST', '/auth/login', { username: 'browser_admin', password: password() })
    const employee = await api.call<Login>('POST', '/auth/login', { username: 'browser_employee', password: password() })
    await provide({ adminToken: admin.accessToken, employeeToken: employee.accessToken })
  },
  scenario: async ({ api, staff }, provide) => {
    const suffix = randomBytes(6).toString('hex')
    const username = `browser_customer_${suffix}`
    const customer = await api.call<Login>('POST', '/auth/register', { username, password: password(), documento: `B-${suffix}`, primerNombre: 'Prueba' })
    const address = await api.call<{ direccionId: number }>('POST', '/direcciones/me', { lineaDir: 'Dirección ficticia E2E', barrio: 'Pruebas' }, customer.accessToken)
    const supplier = await api.call<{ proveedorId: number }>('POST', '/proveedores', { nombre: `Proveedor E2E ${suffix}` }, staff.adminToken)
    const category = await api.call<{ categoriaId: number }>('POST', '/categorias', { nombre: `Categoría E2E ${suffix}` }, staff.adminToken)
    const product = await api.call<Product>('POST', '/productos', {
      nombre: `Producto E2E ${suffix}`, cantidad: 10, precio: 19000,
      proveedorId: supplier.proveedorId, categoriaIds: [category.categoriaId],
    }, staff.adminToken)
    await provide({ username, customerToken: customer.accessToken, addressId: address.direccionId,
      supplierId: supplier.proveedorId, product,
      order: async () => {
        await api.call('POST', '/carritos/me/items', { productoId: product.productoId, cantidad: 2 }, customer.accessToken)
        const created = await api.call<{ pedidoId: number }>('POST', '/carritos/me/checkout', { direccionId: address.direccionId, metodoPago: 'TRANSFERENCIA' }, customer.accessToken)
        return api.call<Order>('GET', `/pedidos/${created.pedidoId}`, undefined, staff.adminToken)
      },
    })
  },
})
export { expect }
