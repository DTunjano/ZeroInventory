import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  BadgeCheck,
  CalendarClock,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  Loader2,
  Package,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react'
import { getMyOrders } from '@/modules/orders/application/orders.use-cases'
import { ordersQueryKey } from '@/modules/orders/infrastructure/orders.api'
import type { Order } from '@/modules/orders/domain/orders.models'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { DropdownSelect } from '@/shared/components/DropdownSelect'
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
    case 'ENVIADO':
      return 'secondary'
    case 'CANCELADO':
    case 'DEVUELTO':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function getStatusLabel(estado: Order['estado']): string {
  switch (estado) {
    case 'CONFIRMADO':
      return 'Pendiente'
    case 'COMPLETADO':
      return 'Pagado'
    case 'ENVIADO':
      return 'Enviado'
    case 'CANCELADO':
      return 'Cancelado'
    case 'DEVUELTO':
      return 'Devuelto'
    default:
      return estado
  }
}

function getPaymentLabel(metodoPago: NonNullable<Order['pago']>['metodoPago']): string {
  return metodoPago === 'EFECTIVO' ? 'Contra entrega' : 'Transferencia'
}

function getPaymentBadgeVariant(estado: NonNullable<Order['pago']>['estado']): 'default' | 'secondary' | 'destructive' {
  switch (estado) {
    case 'APROBADO':
      return 'default'
    case 'RECHAZADO':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function StatCard(props: {
  label: string
  value: string
  description: string
  icon: React.ReactNode
}) {
  const { label, value, description, icon } = props

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.18)] backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">{label}</p>
          <p className="text-xl font-semibold text-white">{value}</p>
          <p className="text-sm text-white/60">{description}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-200 ring-1 ring-inset ring-blue-500/20">
          {icon}
        </div>
      </div>
    </div>
  )
}

function OrderDetailCard(props: { order: Order }) {
  const { order } = props
  const [expanded, setExpanded] = useState(false)

  const itemCount = order.detalles?.length ?? 0
  const paymentMethod = order.pago ? getPaymentLabel(order.pago.metodoPago) : 'Sin pago'

  return (
    <Card className="group overflow-hidden border-border/70 bg-card/95 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-950/10">
      <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-slate-300" />
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-100">
                <Package className="h-4 w-4" />
                Pedido #{order.numeroPedidoUsuario}
              </span>
              <Badge variant={getStatusBadgeVariant(order.estado)}>{getStatusLabel(order.estado)}</Badge>
              <Badge variant="outline">{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</Badge>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/35 px-3 py-2 text-sm text-muted-foreground">
                <CalendarClock className="h-4 w-4 text-blue-500" />
                <span>{formatDate(order.fecha)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/35 px-3 py-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4 text-blue-500" />
                <span>{paymentMethod}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-slate-950 via-card to-card p-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)] lg:min-w-56 lg:text-right">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Total del pedido</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{formatPrice(order.total)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Método de pago: {order.pago ? getPaymentLabel(order.pago.metodoPago) : 'Sin registrar'}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Estado"
            value={getStatusLabel(order.estado)}
            description="Situación actual del pedido"
            icon={<BadgeCheck className="h-5 w-5" />}
          />
          <StatCard
            label="Pago"
            value={order.pago ? order.pago.estado : 'Pendiente'}
            description={order.pago ? `Monto ${formatPrice(order.pago.monto)}` : 'Aún no registrado'}
            icon={<CircleDollarSign className="h-5 w-5" />}
          />
          <StatCard
            label="Entrega"
            value={order.estado === 'ENVIADO' ? 'En camino' : 'En preparación'}
            description={order.estado === 'ENVIADO' ? 'Tu pedido ya salió' : 'Todavía en proceso'}
            icon={<Truck className="h-5 w-5" />}
          />
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="space-y-5 border-t border-border/70 pt-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Package className="h-4 w-4" />
                    Productos
                  </div>
                  <div className="space-y-3 rounded-2xl border border-border/70 bg-background/80 p-4">
                    {order.detalles && order.detalles.length > 0 ? (
                      order.detalles.map((item) => (
                        <div
                          key={item.pedidoDetalleId}
                          className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-card/70 p-3"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="truncate font-medium text-foreground">{item.productoNombre}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.cantidad} x {formatPrice(item.precioUnitario)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{formatPrice(item.subtotal)}</p>
                            <p className="text-xs text-muted-foreground">Subtotal</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        No hay detalles de productos disponibles
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    Información de pago
                  </div>
                  {order.pago ? (
                    <div className="grid gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 sm:grid-cols-2">
                      <div className="rounded-xl bg-card/80 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Método</p>
                        <p className="mt-1 font-medium text-foreground">{getPaymentLabel(order.pago.metodoPago)}</p>
                      </div>
                      <div className="rounded-xl bg-card/80 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Estado</p>
                        <div className="mt-2">
                          <Badge variant={getPaymentBadgeVariant(order.pago.estado)}>
                            {order.pago.estado === 'PENDIENTE'
                              ? 'Pendiente'
                              : order.pago.estado === 'APROBADO'
                                ? 'Aprobado'
                                : 'Rechazado'}
                          </Badge>
                        </div>
                      </div>
                      <div className="rounded-xl bg-card/80 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Monto</p>
                        <p className="mt-1 font-medium text-foreground">{formatPrice(order.pago.monto)}</p>
                      </div>
                      <div className="rounded-xl bg-card/80 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Fecha de pago</p>
                        <p className="mt-1 font-medium text-foreground">{formatDate(order.pago.fechaPago)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      No hay información de pago disponible
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end">
          <Button
            variant={expanded ? 'secondary' : 'ghost'}
            className="w-full gap-2 sm:w-auto"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Ocultar detalles' : 'Ver detalles'}
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card className="border-dashed border-border/70 bg-card/80">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 ring-1 ring-inset ring-blue-500/15">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Sin pedidos</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            No tienes pedidos aún. Explora la tienda y completa tu primera compra para ver tu historial aquí.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function MyOrdersPage() {
  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | Order['estado']>('ALL')
  const [dateFrom, setDateFrom] = useState<string | null>(null)
  const [dateTo, setDateTo] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'fecha_desc' | 'fecha_asc' | 'total_desc' | 'total_asc'>('fecha_desc')

  const ordersQuery = useQuery({
    queryKey: [...ordersQueryKey, statusFilter, dateFrom ?? '', dateTo ?? '', sortBy],
    queryFn: () =>
      getMyOrders({
        ...(statusFilter !== 'ALL' ? { estado: statusFilter } : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
        sortBy,
      }),
    placeholderData: keepPreviousData,
  })

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data])
  const hasOrders = orders.length > 0

  const summary = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
    const latestOrder = orders.reduce<Order | null>((currentLatest, order) => {
      if (!currentLatest) {
        return order
      }

      return new Date(order.fecha).getTime() > new Date(currentLatest.fecha).getTime()
        ? order
        : currentLatest
    }, null)

    return {
      totalSpent,
      latestOrder,
    }
  }, [orders])

  const filteredAndSortedOrders = useMemo(() => {
    let list = [...orders]

    if (statusFilter !== 'ALL') {
      list = list.filter((o) => o.estado === statusFilter)
    }

    if (dateFrom) {
      const from = new Date(dateFrom)
      list = list.filter((o) => new Date(o.fecha) >= from)
    }

    if (dateTo) {
      const to = new Date(dateTo)
      // include the whole day
      to.setHours(23, 59, 59, 999)
      list = list.filter((o) => new Date(o.fecha) <= to)
    }

    switch (sortBy) {
      case 'fecha_asc':
        list.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
        break
      case 'fecha_desc':
        list.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        break
      case 'total_asc':
        list.sort((a, b) => a.total - b.total)
        break
      case 'total_desc':
        list.sort((a, b) => b.total - a.total)
        break
    }

    return list
  }, [orders, statusFilter, dateFrom, dateTo, sortBy])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-slate-950 via-card to-card shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
        <CardContent className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))] lg:items-center lg:p-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Historial de compras
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Mis pedidos</h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Revisa el estado de cada compra, el detalle de productos y la información de pago desde una vista más clara y profesional.
              </p>
            </div>
          </div>

          <StatCard
            label="Pedidos"
            value={String(orders.length)}
            description="Compras registradas en tu cuenta"
            icon={<ShoppingBag className="h-5 w-5" />}
          />
          <StatCard
            label="Gastado"
            value={formatPrice(summary.totalSpent)}
            description="Total acumulado en pedidos"
            icon={<CircleDollarSign className="h-5 w-5" />}
          />
          <StatCard
            label="Último pedido"
            value={summary.latestOrder ? `#${summary.latestOrder.numeroPedidoUsuario}` : 'N/A'}
            description={summary.latestOrder ? formatDate(summary.latestOrder.fecha) : 'Aún no hay actividad'}
            icon={<CalendarClock className="h-5 w-5" />}
          />
        </CardContent>
      </Card>

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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="text-xs text-white/70">Estado</label>
                <div className="mt-1">
                  <DropdownSelect
                    value={statusFilter}
                    onChange={(v) => setStatusFilter(v ?? 'ALL')}
                    options={[
                      { value: 'ALL', label: 'Todos' } as any,
                      { value: 'CONFIRMADO', label: 'Pendiente' } as any,
                      { value: 'COMPLETADO', label: 'Pagado' } as any,
                      { value: 'ENVIADO', label: 'Enviado' } as any,
                      { value: 'CANCELADO', label: 'Cancelado' } as any,
                      { value: 'DEVUELTO', label: 'Devuelto' } as any,
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/70">Desde</label>
                <Input type="date" value={dateFrom ?? ''} onChange={(e) => setDateFrom(e.target.value || null)} className="mt-1" />
              </div>

              <div>
                <label className="text-xs text-white/70">Hasta</label>
                <Input type="date" value={dateTo ?? ''} onChange={(e) => setDateTo(e.target.value || null)} className="mt-1" />
              </div>

              <div>
                <label className="text-xs text-white/70">Ordenar</label>
                <div className="mt-1">
                  <DropdownSelect
                    value={sortBy}
                    onChange={(v) => setSortBy(v ?? 'fecha_desc')}
                    options={[
                      { value: 'fecha_desc', label: 'Fecha: más recientes' } as any,
                      { value: 'fecha_asc', label: 'Fecha: más antiguas' } as any,
                      { value: 'total_desc', label: 'Total: mayor' } as any,
                      { value: 'total_asc', label: 'Total: menor' } as any,
                    ]}
                    width="220px"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAndSortedOrders.map((order) => (
              <OrderDetailCard key={order.pedidoId} order={order} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
