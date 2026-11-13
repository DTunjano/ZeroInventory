import type { ComponentType, ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Clock3 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import { formatCOP } from '@/shared/lib/currency'
import { useSettingsStore } from '@/modules/settings/application/settings.store'

import type {
  MonthlySeriesPoint,
  RecentActivityPoint,
  RecentOrderPoint,
  TopProductPoint,
} from '../../domain/admin-dashboard.models'

export function formatCurrency(value: number): string {
  return formatCOP(value)
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatPeriod(period: string): string {
  const [year, month] = period.split('-').map((part) => Number(part))
  if (!year || !month) return period
  return new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(new Date(year, month - 1, 1))
}

export function getGrowth(points: MonthlySeriesPoint[]): { value: number; direction: 'up' | 'down' | 'flat' } {
  if (points.length < 2) return { value: 0, direction: 'flat' }

  const previous = points[points.length - 2]?.value ?? 0
  const current = points[points.length - 1]?.value ?? 0

  if (previous === 0) {
    return { value: current === 0 ? 0 : 100, direction: current === 0 ? 'flat' : 'up' }
  }

  const value = ((current - previous) / previous) * 100
  return {
    value: Math.abs(value),
    direction: value > 0 ? 'up' : value < 0 ? 'down' : 'flat',
  }
}

function TrendLabel({ value, direction }: { value: number; direction: 'up' | 'down' | 'flat' }) {
  if (direction === 'flat') {
    return <span className="text-muted-foreground">Sin variación</span>
  }

  const isPositive = direction === 'up'
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight

  return (
    <span className={cn('inline-flex items-center gap-1', isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400')}>
      <Icon className="h-4 w-4" />
      {isPositive ? '+' : '-'}{value.toFixed(1)}%
    </span>
  )
}

export function DashboardStatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string
  value: string
  description: string
  icon: ComponentType<{ className?: string }>
  trend?: { value: number; direction: 'up' | 'down' | 'flat' }
}) {
  const theme = useSettingsStore((state) => state.theme)
  const isDark = theme === 'dark'

  return (
    <Card className={cn('overflow-hidden transition-transform duration-300 hover:-translate-y-0.5', isDark ? 'border-border bg-gradient-to-br from-muted/30 to-muted/30 shadow-[0_24px_80px_rgba(0,0,0,0.24)] hover:border-blue-500/30' : 'border-slate-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-md')}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardDescription className={cn('text-sm', isDark ? 'text-muted-foreground' : 'text-muted-foreground')}>{title}</CardDescription>
          <CardTitle className={cn('mt-3 text-3xl font-semibold tracking-tight', isDark ? 'text-foreground' : 'text-slate-900')}>{value}</CardTitle>
        </div>
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl border', isDark ? 'border-border bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-blue-100 bg-blue-50 text-blue-600')}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className={isDark ? 'text-muted-foreground' : 'text-muted-foreground'}>{description}</span>
          {trend ? <TrendLabel value={trend.value} direction={trend.direction} /> : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardPanelCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  const theme = useSettingsStore((state) => state.theme)
  const isDark = theme === 'dark'

  return (
    <Card className={cn('overflow-hidden', isDark ? 'border-border bg-muted/50 shadow-[0_24px_80px_rgba(0,0,0,0.2)]' : 'border-slate-200 bg-white shadow-sm')}>
      <CardHeader className="space-y-1">
        <CardTitle className={cn('text-xl', isDark ? 'text-foreground' : 'text-slate-900')}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-72 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-5 w-96 bg-slate-200 dark:bg-white/10" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-2xl bg-slate-200 dark:bg-white/10" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-[360px] rounded-2xl bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-[360px] rounded-2xl bg-slate-200 dark:bg-white/10" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-[420px] rounded-2xl bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-[420px] rounded-2xl bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
  )
}

export function TopProductsList({ products }: { products: TopProductPoint[] }) {
  if (!products.length) {
    return <div className="text-sm text-muted-foreground dark:text-white/55">Todavía no hay productos vendidos para mostrar.</div>
  }

  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <div key={product.productId} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-white/8 dark:bg-black/25">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-sm font-semibold text-white">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-slate-900 dark:text-white">{product.name}</div>
            <div className="text-sm text-muted-foreground dark:text-white/55">{formatCompact(product.soldQuantity)} vendidos</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-slate-900 dark:text-white">{formatCurrency(product.revenue)}</div>
            <div className="text-xs text-muted-foreground dark:text-white/45">Ingresos</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function RecentOrdersList({ orders }: { orders: RecentOrderPoint[] }) {
  if (!orders.length) {
    return <div className="text-sm text-muted-foreground dark:text-white/55">No hay pedidos aprobados recientes.</div>
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.orderId} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition-colors hover:border-blue-300 dark:border-white/8 dark:bg-black/25 dark:hover:border-blue-500/30">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Pedido #{order.orderId}</div>
              <div className="text-sm text-muted-foreground dark:text-white/55">{order.customerName}</div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground dark:text-white/40">
                <span>{formatDateTime(order.date)}</span>
                <span>•</span>
                <span>{formatCompact(order.itemsCount)} productos</span>
                <span>•</span>
                <span>{order.paymentMethod}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-slate-900 dark:text-white">{formatCurrency(order.total)}</div>
              <Badge className="mt-2 border-0 bg-emerald-600 text-white hover:bg-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/15">
                {order.paymentStatus}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ActivityFeedList({ activity }: { activity: RecentActivityPoint[] }) {
  if (!activity.length) {
    return <div className="text-sm text-muted-foreground dark:text-white/55">Sin movimientos de inventario recientes.</div>
  }

  return (
    <div className="space-y-3">
      {activity.map((item) => (
        <div key={item.movementId} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-white/8 dark:bg-black/25">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', item.typeMovement === 'SALIDA' ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300')}>
            <Clock3 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-slate-900 dark:text-white">{item.productName}</div>
            <div className="text-sm text-muted-foreground dark:text-white/55">
              {item.typeMovement} · {formatCompact(item.quantity)} unidades · Ref {item.referenceId}
            </div>
          </div>
          <div className="text-xs text-muted-foreground dark:text-white/45">{formatDateTime(item.date)}</div>
        </div>
      ))}
    </div>
  )
}

export function DashboardTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-2xl border border-border bg-card px-3 py-2 text-sm shadow-2xl backdrop-blur-xl">
      <div className="mb-2 font-medium text-foreground">{label}</div>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name ?? String(entry.value)} className="flex items-center justify-between gap-4 text-muted-foreground">
            <span>{entry.name ?? 'Serie'}</span>
            <span className="font-medium text-foreground">{formatCompact(entry.value ?? 0)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardLegendChip({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

