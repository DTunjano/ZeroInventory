import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { ordersApi } from '../infrastructure/orders.api'
import type { OrderStatus } from '../domain/orders.models'
import { useAuthStore } from '@/modules/auth/application/auth.store'
import { OrderActions, orderStates } from './order-actions'
import { OrderHistory } from './order-history'
import { Button } from '@/shared/ui/button'
import { Select } from '@/shared/ui/select'
import { Label } from '@/shared/ui/label'
import { formatCOP } from '@/shared/lib/currency'
import { getApiErrorMessage } from '@/shared/lib/api-error'
export function AdminOrdersPage() {
  const user = useAuthStore((s) => s.user)
  const [page, setPage] = useState(1),
    [state, setState] = useState<OrderStatus | ''>('')
  const [params, setParams] = useSearchParams(),
    id = Number(params.get('order'))
  const validId = Number.isInteger(id) && id > 0 && id <= 2147483647
  const list = useQuery({
    queryKey: ['admin-orders', user?.usuarioId, page, state],
    queryFn: () =>
      ordersApi.list({ page, ...(state ? { estado: state } : {}) }),
  })
  const detail = useQuery({
    queryKey: ['order-detail', user?.usuarioId, id],
    enabled: validId,
    queryFn: () => ordersApi.getOrderById(id),
  })
  const order = detail.data
  return (
    <div className="mx-auto min-w-0 max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Pedidos y pagos internos</h1>
        <p className="text-sm text-muted-foreground">
          Verifica el pago antes de enviar; registra la entrega por separado.
          Los reembolsos son registros internos, sin transferencias automáticas.
        </p>
      </header>
      <section
        aria-label="Lista de pedidos"
        className="min-w-0 space-y-4 rounded-xl border bg-card p-4"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="order-state">Estado del pedido</Label>
            <Select
              id="order-state"
              value={state}
              onChange={(e) => {
                setState(e.target.value as OrderStatus | '')
                setPage(1)
              }}
            >
              <option value="">Todos los estados</option>
              {Object.entries(orderStates).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <Button
            variant="outline"
            disabled={list.isFetching}
            onClick={() => {
              void list.refetch()
              if (validId) void detail.refetch()
            }}
          >
            Actualizar pedidos
          </Button>
        </div>
        {list.isPending && <p role="status">Cargando pedidos…</p>}
        {list.isError && (
          <p role="alert" className="text-destructive">
            {getApiErrorMessage(
              list.error,
              'No se pudieron consultar los pedidos',
            )}
          </p>
        )}
        {list.data && (
          <>
            {!list.data.data.length ? (
              <p>Sin pedidos para este filtro.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Pedidos registrados</caption>
                  <thead>
                    <tr>
                      {[
                        'Documento',
                        'Cliente',
                        'Estado',
                        'Total',
                        'Ciclo',
                        'Detalle',
                      ].map((h) => (
                        <th key={h} scope="col" className="border-b p-2">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {list.data.data.map((row) => (
                      <tr key={row.pedidoId}>
                        <td className="border-b p-2">
                          #{row.pedidoId} · Consecutivo{' '}
                          {row.numeroPedidoUsuario}
                        </td>
                        <td className="border-b p-2">#{row.clienteId}</td>
                        <td className="border-b p-2">
                          {orderStates[row.estado]}
                        </td>
                        <td className="border-b p-2">{formatCOP(row.total)}</td>
                        <td className="border-b p-2">
                          {row.version ? `Versión ${row.version}` : 'Histórico'}
                        </td>
                        <td className="border-b p-2">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setParams({ order: String(row.pedidoId) })
                            }
                          >
                            Ver pedido #{row.pedidoId}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="outline"
                disabled={page === 1 || list.isFetching}
                onClick={() => setPage((p) => p - 1)}
              >
                Página anterior
              </Button>
              <p>
                Página {page} de {Math.max(1, list.data.totalPages)} ·{' '}
                {list.data.total} pedidos
              </p>
              <Button
                variant="outline"
                disabled={page >= list.data.totalPages || list.isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Página siguiente
              </Button>
            </div>
          </>
        )}
      </section>
      {validId && (
        <section
          aria-label="Detalle del pedido"
          className="min-w-0 space-y-4 rounded-xl border bg-card p-4"
        >
          {detail.isPending && <p role="status">Cargando detalle…</p>}
          {detail.isError && (
            <p role="alert" className="text-destructive">
              {getApiErrorMessage(
                detail.error,
                'No se pudo consultar el detalle',
              )}
            </p>
          )}
          {order && (
            <>
              <h2 className="text-xl font-semibold">
                Pedido #{order.pedidoId} · Cliente #{order.clienteId}
              </h2>
              <p>
                {orderStates[order.estado]} · {formatCOP(order.total)} ·{' '}
                {order.version
                  ? `Versión ${order.version}`
                  : 'Histórico de solo lectura'}
              </p>
              <OrderActions order={order} />
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Líneas del pedido</caption>
                  <thead>
                    <tr>
                      {['Producto', 'Cantidad', 'Precio', 'Subtotal'].map(
                        (h) => (
                          <th key={h} scope="col" className="border-b p-2">
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {order.detalles.map((l) => (
                      <tr key={l.pedidoDetalleId}>
                        <td className="border-b p-2">{l.productoNombre}</td>
                        <td className="border-b p-2">{l.cantidad}</td>
                        <td className="border-b p-2">
                          {formatCOP(l.precioUnitario)}
                        </td>
                        <td className="border-b p-2">
                          {formatCOP(l.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3 className="font-medium">Intentos de pago</h3>
              <ul className="space-y-2 text-sm">
                {order.pagos.map((p) => (
                  <li key={p.pagoId}>
                    Pago #{p.pagoId} · {p.metodoPago} · {p.estado} ·{' '}
                    {formatCOP(p.monto)}
                  </li>
                ))}
              </ul>
              <OrderHistory order={order} />
            </>
          )}
        </section>
      )}
    </div>
  )
}
