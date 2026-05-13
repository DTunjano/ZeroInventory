import { ArrowDownIcon, ArrowUpIcon, Package, RefreshCw, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useInventoryAdjustments } from '@/modules/admin-dashboard/application/use-inventory-adjustments'
import { formatCurrency, formatCompact, formatDateTime, DashboardSkeleton } from '@/modules/admin-dashboard/presentation/components/dashboard-widgets'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'

function AdjustmentsTable({
  rows,
}: {
  rows: Awaited<ReturnType<typeof useInventoryAdjustments>>['data'] extends infer T ? T extends { data: infer D } ? D : never : never
}) {
  if (!rows.length) {
    return <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-white/60">No hay ajustes para mostrar.</div>
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      <div className="overflow-x-auto">
        <table className="min-w-[1240px] w-full border-separate border-spacing-0 text-sm">
          <thead className="bg-white/[0.03] text-white/55">
            <tr>
              <th className="px-5 py-4 text-left font-medium">Código</th>
              <th className="px-5 py-4 text-left font-medium">Usuario</th>
              <th className="px-5 py-4 text-right font-medium">Stock anterior</th>
              <th className="px-5 py-4 text-right font-medium">Stock nuevo</th>
              <th className="px-5 py-4 text-right font-medium">Cantidad ajustada</th>
              <th className="px-5 py-4 text-left font-medium">Tipo</th>
              <th className="px-5 py-4 text-left font-medium">Motivo</th>
              <th className="px-5 py-4 text-left font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <tr key={row.ajusteInventarioId} className="transition-colors hover:bg-white/[0.03]">
                <td className="px-5 py-5 align-top">
                  <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-white/55">
                    {row.productoSku}
                  </div>
                </td>
                <td className="px-5 py-5 align-top">
                  <div className="font-medium text-white">{row.usuarioNombre}</div>
                  <div className="text-xs text-white/45">Responsable</div>
                </td>
                <td className="px-5 py-5 align-top text-right text-white/70">{formatCompact(row.stockAnterior)}</td>
                <td className="px-5 py-5 align-top text-right text-white/70">{formatCompact(row.stockNuevo)}</td>
                <td className="px-5 py-5 align-top text-right text-white font-medium">{formatCompact(row.cantidad)}</td>
                <td className="px-5 py-5 align-top">
                  <Badge className={row.tipoCambio === 'AUMENTO' ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10 inline-flex items-center gap-1.5' : 'border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/10 inline-flex items-center gap-1.5'}>
                    {row.tipoCambio === 'AUMENTO' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                    {row.tipoCambio}
                  </Badge>
                </td>
                <td className="px-5 py-5 align-top text-white/65">{row.motivo}</td>
                <td className="px-5 py-5 align-top text-white/50">{formatDateTime(row.fecha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminInventoryAdjustmentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [tipoCambioFilter, setTipoCambioFilter] = useState<'TODOS' | 'AUMENTO' | 'REDUCCION'>('TODOS')
  const queryClient = useQueryClient()

  const filters = useMemo(() => {
    const trimmedSearch = search.trim()

    return {
      page,
      limit: 15,
      ...(trimmedSearch ? { search: trimmedSearch } : {}),
      ...(tipoCambioFilter !== 'TODOS' ? { tipoCambio: tipoCambioFilter } : {}),
    }
  }, [page, search, tipoCambioFilter])

  const query = useInventoryAdjustments(filters)

  // Setup polling para autorefresh cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      query.refetch()
    }, 5000)

    return () => clearInterval(interval)
  }, [query])

  if (query.isPending) {
    return <DashboardSkeleton />
  }

  if (query.isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6">
          <h2 className="text-lg font-semibold text-rose-300">Error al cargar ajustes</h2>
          <p className="mt-2 text-sm text-rose-200/70">Revisa la conexión con el backend o tus permisos.</p>
        </div>
      </div>
    )
  }

  const data = query.data

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      {/* Header */}
      <section className="flex items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Auditoría de inventario
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Historial de cambios</h1>
          <p className="max-w-2xl text-sm text-white/65">Seguimiento completo de ajustes manuales con trazabilidad de usuarios y fechas</p>
        </div>

        <button
          onClick={() => query.refetch()}
          disabled={query.isRefetching}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/[0.08] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${query.isRefetching ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </section>

      {/* Filtros */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(['TODOS', 'AUMENTO', 'REDUCCION'] as const).map((tipo) => (
            <button
              key={tipo}
              onClick={() => {
                setTipoCambioFilter(tipo)
                setPage(1)
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                tipoCambioFilter === tipo
                  ? tipo === 'AUMENTO'
                    ? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-200'
                    : tipo === 'REDUCCION'
                      ? 'border border-rose-500/30 bg-rose-500/20 text-rose-200'
                      : 'border border-blue-500/30 bg-blue-500/20 text-blue-200'
                  : 'border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'
              }`}
            >
              {tipo === 'AUMENTO' ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : tipo === 'REDUCCION' ? (
                <ArrowDownIcon className="h-4 w-4" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              {tipo}
            </button>
          ))}
        </div>

        <div className="w-full max-w-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <Input
              value={search}
              onChange={(event) => {
                setPage(1)
                setSearch(event.target.value)
              }}
              placeholder="Buscar producto, usuario o motivo"
              className="h-11 border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/35"
            />
          </div>
        </div>
      </section>

      {/* Tabla */}
      <section>
        <AdjustmentsTable rows={data.data} />
      </section>

      {/* Paginación elegante integrada */}
      <section className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <span className="font-medium text-white">{data.total}</span>
          <span>registro{data.total !== 1 ? 's' : ''}</span>
          <span className="mx-2 text-white/30">•</span>
          <span>Pág. <span className="font-medium text-white">{data.page}</span> de <span className="font-medium text-white">{data.totalPages}</span></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            disabled={page === 1}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-white transition-all hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(current + 1, data.totalPages))}
            disabled={page >= data.totalPages}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-white transition-all hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  )
}