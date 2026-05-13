import type { ComponentType, ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, BarChart3, Clock3 } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'

import type {
  AdminDashboardSummary,
  InventoryMovementPoint,
  MonthlySeriesPoint,
  RecentActivityPoint,
  RecentOrderPoint,
  TopProductPoint,
} from '../../domain/admin-dashboard.models'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
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
    return <span className="text-white/50">Sin variación</span>
  }

  const isPositive = direction === 'up'
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight

  return (
    <span className={cn('inline-flex items-center gap-1', isPositive ? 'text-emerald-400' : 'text-red-400')}>
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
  return (
    <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.24)] transition-transform duration-300 hover:-translate-y-0.5 hover:border-blue-500/30">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardDescription className="text-sm text-white/65">{title}</CardDescription>
          <CardTitle className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</CardTitle>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-blue-500/10 text-blue-300">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-white/55">{description}</span>
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
  return (
    <Card className="overflow-hidden border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl text-white">{title}</CardTitle>
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
        <Skeleton className="h-10 w-72 bg-white/10" />
        <Skeleton className="h-5 w-96 bg-white/10" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-2xl bg-white/10" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-[360px] rounded-2xl bg-white/10" />
        <Skeleton className="h-[360px] rounded-2xl bg-white/10" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-[420px] rounded-2xl bg-white/10" />
        <Skeleton className="h-[420px] rounded-2xl bg-white/10" />
      </div>
    </div>
  )
}

export function TopProductsList({ products }: { products: TopProductPoint[] }) {
  if (!products.length) {
    return <div className="text-sm text-white/55">Todavía no hay productos vendidos para mostrar.</div>
  }

  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <div key={product.productId} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-black/25 px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-sm font-semibold text-white">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-white">{product.name}</div>
            <div className="text-sm text-white/55">{formatCompact(product.soldQuantity)} vendidos</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-white">{formatCurrency(product.revenue)}</div>
            <div className="text-xs text-white/45">Ingresos</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function RecentOrdersList({ orders }: { orders: RecentOrderPoint[] }) {
  if (!orders.length) {
    return <div className="text-sm text-white/55">No hay pedidos aprobados recientes.</div>
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.orderId} className="rounded-2xl border border-white/8 bg-black/25 px-4 py-4 transition-colors hover:border-blue-500/30">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-white">Pedido #{order.orderId}</div>
              <div className="text-sm text-white/55">{order.customerName}</div>
              <div className="mt-1 text-xs text-white/40">{formatDateTime(order.date)}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-white">{formatCurrency(order.total)}</div>
              <Badge className="mt-2 border-0 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15">
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
    return <div className="text-sm text-white/55">Sin movimientos de inventario recientes.</div>
  }

  return (
    <div className="space-y-3">
      {activity.map((item) => (
        <div key={item.movementId} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-black/25 px-4 py-4">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', item.typeMovement === 'SALIDA' ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300')}>
            <Clock3 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-white">{item.productName}</div>
            <div className="text-sm text-white/55">
              {item.typeMovement} · {formatCompact(item.quantity)} unidades · Ref {item.referenceId}
            </div>
          </div>
          <div className="text-xs text-white/45">{formatDateTime(item.date)}</div>
        </div>
      ))}
    </div>
  )
}

export function DashboardLegendChip({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs text-white/70">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

