import { Sparkles, ArrowRight, TrendingUp, PieChart, LineChart } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AdminReportsPage() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Análisis de Ventas',
      description: 'Tendencias mensuales y anuales con proyecciones',
    },
    {
      icon: PieChart,
      title: 'Distribución de Productos',
      description: 'Ventas por categoría y análisis de SKU',
    },
    {
      icon: LineChart,
      title: 'Movimientos de Inventario',
      description: 'Histórico detallado de entradas y salidas',
    },
  ]

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2">
          <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
          <span className="text-sm font-medium text-blue-200">Proximamente disponible</span>
        </div>
        <h1 className="text-4xl font-bold text-white">Reportes Avanzados</h1>
        <p className="max-w-2xl text-lg text-white/70">
          Estamos construyendo un conjunto completo de reportes y análisis para potenciar tu toma de decisiones
        </p>
      </section>

      {/* Features Preview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature, idx) => {
          const Icon = feature.icon
          return (
            <div
              key={idx}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-6 hover:border-blue-500/20 transition-all hover:bg-blue-500/5"
            >
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
                <Icon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </div>
          )
        })}
      </section>

      {/* Timeline */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Fases de desarrollo</h2>
        <div className="space-y-3">
          {[
            { phase: 'Fase 1', title: 'Dashboard de Ventas', status: 'próximo' },
            { phase: 'Fase 2', title: 'Análisis de Inventario', status: 'planificado' },
            { phase: 'Fase 3', title: 'Reportes Personalizados', status: 'planificado' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4 hover:bg-white/[0.05] transition-all"
            >
              <div className={`h-3 w-3 rounded-full ${idx === 0 ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-400">{item.phase}</div>
                <div className="text-base font-semibold text-white">{item.title}</div>
              </div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 transition-all group"
        >
          Volver al Dashboard
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/inventory-adjustments"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.08] text-white font-medium px-6 py-3 transition-all"
        >
          Ver Auditoría de Stock
        </Link>
      </section>

      {/* Footer note */}
      <section className="text-sm text-slate-500 border-t border-white/10 pt-6">
        <p>
          Mientras tanto, puedes explorar{' '}
          <Link to="/admin/inventory-adjustments" className="text-blue-400 hover:text-blue-300">
            el historial de ajustes
          </Link>
          {' '}y{' '}
          <Link to="/admin" className="text-blue-400 hover:text-blue-300">
            las métricas del dashboard
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
