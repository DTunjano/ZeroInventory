import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3, Package, ShoppingCart, Users, Warehouse, TrendingUp, Banknote } from 'lucide-react'

import { useAdminDashboard } from '@/modules/admin-dashboard/application/use-admin-dashboard'
import {
  ActivityFeedList,
  DashboardTooltip,
  DashboardLegendChip,
  DashboardPanelCard,
  DashboardSkeleton,
  DashboardStatCard,
  RecentOrdersList,
  TopProductsList,
  formatCurrency,
  formatPeriod,
  getGrowth,
} from '@/modules/admin-dashboard/presentation/components/dashboard-widgets'

export function AdminDashboardPage() {
  const dashboardQuery = useAdminDashboard()

  if (dashboardQuery.isPending) {
    return <DashboardSkeleton />
  }

  if (dashboardQuery.isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <DashboardPanelCard title="No se pudo cargar el dashboard" description="Revisa la conexión con el backend o tus permisos de admin.">
          <p className="text-sm text-white/70">{dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Error desconocido'}</p>
        </DashboardPanelCard>
      </div>
    )
  }

  const data = dashboardQuery.data
  const revenueGrowth = getGrowth(data.revenueOverview)
  const ordersGrowth = getGrowth(data.orderVolume)
  const revenueSeries = data.revenueOverview.map((point) => ({
    label: formatPeriod(point.period),
    value: point.value,
  }))
  const orderSeries = data.orderVolume.map((point) => ({
    label: formatPeriod(point.period),
    value: point.value,
  }))

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
            <BarChart3 className="h-3.5 w-3.5" />
            Admin Dashboard
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">Dashboard principal</h1>
          <p className="max-w-2xl text-sm text-white/65 lg:text-base">
            Panel ejecutivo para seguimiento de ventas, pedidos, inventario y actividad reciente en Zero Inventory.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-white/60">
          <DashboardLegendChip label="Ventas" color="#3b82f6" />
          <DashboardLegendChip label="Pedidos" color="#60a5fa" />
          <DashboardLegendChip label="Inventario" color="#8b5cf6" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Total de pedidos"
          value={String(data.summary.totalPedidos)}
          description="Pedidos registrados en el sistema"
          icon={ShoppingCart}
          trend={ordersGrowth}
        />
        <DashboardStatCard
          title="Ingresos"
          value={formatCurrency(data.summary.totalIngresos)}
          description="Pagos aprobados"
          icon={Banknote}
          trend={revenueGrowth}
        />
        <DashboardStatCard
          title="Productos"
          value={String(data.summary.totalProductos)}
          description={`${data.summary.productosBajoStock} con bajo stock`}
          icon={Package}
        />
        <DashboardStatCard
          title="Usuarios"
          value={String(data.summary.totalUsuarios)}
          description="Cuentas registradas"
          icon={Users}
        />
        <DashboardStatCard
          title="Movimientos de inventario"
          value={String(data.summary.totalMovimientosInventario)}
          description="Entradas y salidas del kárdex"
          icon={Warehouse}
        />
        <DashboardStatCard
          title="Productos vendidos"
          value={String(data.summary.totalProductosVendidos)}
          description={`${data.summary.pedidosCompletados} pedidos completados`}
          icon={TrendingUp}
        />
        <DashboardStatCard
          title="Pedidos completados"
          value={String(data.summary.pedidosCompletados)}
          description="Ordenes con pago aprobado"
          icon={BarChart3}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DashboardPanelCard title="Resumen de Ingresos" description="Desempeño de ventas mensual">
          <div className="mb-4 flex flex-wrap gap-2">
            <DashboardLegendChip label="Ingresos aprobados" color="#3b82f6" />
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.45)" />
                <YAxis tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.45)" />
                <Tooltip content={<DashboardTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardPanelCard>

        <DashboardPanelCard title="Volumen de Pedidos" description="Conteo de pedidos mensual">
          <div className="mb-4 flex flex-wrap gap-2">
            <DashboardLegendChip label="Pedidos" color="#60a5fa" />
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderSeries}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.45)" />
                <YAxis tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.45)" />
                <Tooltip content={<DashboardTooltip />} />
                <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardPanelCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardPanelCard title="Productos más vendidos" description="Calculado a partir de movimientos de salida/venta del Kárdex">
          <TopProductsList products={data.topProducts} />
        </DashboardPanelCard>

        <DashboardPanelCard title="Pedidos recientes" description="Últimos pedidos con pago aprobado">
          <RecentOrdersList orders={data.recentOrders} />
        </DashboardPanelCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DashboardPanelCard title="Movimientos de Inventario" description="Actividad mensual del Kárdex">
          <div className="mb-4 flex flex-wrap gap-2">
            <DashboardLegendChip label="Entradas" color="#22c55e" />
            <DashboardLegendChip label="Salidas" color="#ef4444" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.inventoryMovements.map((point) => ({
                  label: formatPeriod(point.period),
                  entradas: point.entradas,
                  salidas: point.salidas,
                }))}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.45)" />
                <YAxis tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.45)" />
                <Tooltip content={<DashboardTooltip />} />
                <Line type="linear" name="Entradas" dataKey="entradas" stroke="#22c55e" strokeWidth={2.5} dot={false} />
                <Line type="linear" name="Salidas" dataKey="salidas" stroke="#ef4444" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DashboardPanelCard>

        <DashboardPanelCard title="Actividad reciente" description="Últimos movimientos de inventario">
          <ActivityFeedList activity={data.recentActivity} />
        </DashboardPanelCard>
      </section>
    </div>
  )
}
