import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Loader2, ShoppingBag } from 'lucide-react'
import { getMyOrders } from '@/modules/orders/application/orders.use-cases'
import { ordersQueryKey } from '@/modules/orders/infrastructure/orders.api'
import type { Order } from '@/modules/orders/domain/orders.models'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { getApiErrorMessage } from '@/shared/lib/api-error'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function getStatusBadgeVariant(estado: Order['estado']): 'default' | 'secondary' | 'destructive' {
  switch (estado) {
    case 'COMPLETADO':
      return 'default'
    case 'CONFIRMADO':
      return 'secondary'
    case 'ENVIADO':
      return 'default'
    case 'CANCELADO':
    case 'DEVUELTO':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function OrderDetailCard(props: { order: Order }) {
  const { order } = props
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="overflow-hidden border bg-card/80 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Pedido #{order.pedidoId}</h3>
              <Badge variant={getStatusBadgeVariant(order.estado)}>{order.estado}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(order.fecha)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold">{formatPrice(order.total)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        {expanded && (
          <>
            {/* Order Details */}
            {order.detalles && order.detalles.length > 0 && (
              <div className="space-y-2 rounded-lg border bg-background p-3">
                <h4 className="text-sm font-medium">Productos</h4>
                <div className="space-y-2">
                  {order.detalles.map((item) => (
                    <div
                      key={item.pedidoDetalleId}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.productoNombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.cantidad} × {formatPrice(item.precioUnitario)}
                        </p>
                      </div>
                      <p className="font-medium">{formatPrice(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Info */}
            {order.pago && (
              <div className="space-y-2 rounded-lg border bg-background p-3">
                <h4 className="text-sm font-medium">Información de pago</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Método:</span>
                    <span className="font-medium">
                      {order.pago.metodoPago === 'EFECTIVO' ? 'Contra entrega' : 'Transferencia'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge variant="secondary">{order.pago.estado}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de pago:</span>
                    <span className="font-medium">{formatDate(order.pago.fechaPago)}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Ocultar detalles' : 'Ver detalles'}
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </Button>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Sin pedidos</h2>
          <p className="text-sm text-muted-foreground">
            No tienes pedidos aún. ¡Comienza a comprar en la tienda!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function MyOrdersPage() {
  const [expanded, setExpanded] = useState<number | null>(null)

  const ordersQuery = useQuery({
    queryKey: ordersQueryKey,
    queryFn: getMyOrders,
  })

  const orders = ordersQuery.data ?? []
  const hasOrders = orders.length > 0

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Mis pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Revisa el historial y el estado de tus compras.
        </p>
      </div>

      {ordersQuery.isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Cargando pedidos…
          </CardContent>
        </Card>
      ) : ordersQuery.isError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">No se pudieron cargar los pedidos</CardTitle>
            <CardDescription>
              {getApiErrorMessage(ordersQuery.error, 'Ocurrió un error al cargar tus pedidos')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => void ordersQuery.refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : !hasOrders ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderDetailCard key={order.pedidoId} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
