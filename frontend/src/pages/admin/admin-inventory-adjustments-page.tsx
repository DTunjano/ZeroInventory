import { ArrowDownIcon, ArrowUpIcon, Package, RefreshCw, Search, SlidersHorizontal, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useInventoryAdjustments } from '@/modules/admin-dashboard/application/use-inventory-adjustments'
import { formatCurrency, formatCompact, formatDateTime, DashboardSkeleton } from '@/modules/admin-dashboard/presentation/components/dashboard-widgets'
import { useSettingsStore } from '@/modules/settings/application/settings.store'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { ModalBase } from '@/shared/ui/modals/modal-base'

function AdjustmentsTable({
  rows,
}: {
  rows: Awaited<ReturnType<typeof useInventoryAdjustments>>['data'] extends infer T ? T extends { data: infer D } ? D : never : never
}) {
  const theme = useSettingsStore((state) => state.theme)
  const isDark = theme === 'dark'

  if (!rows.length) {
    return <div className={cn('rounded-2xl border p-6 text-sm', isDark ? 'border-white/10 bg-black/20 text-white/60' : 'border-slate-200 bg-white text-slate-500 shadow-sm')}>No hay ajustes para mostrar.</div>
  }

  return (
    <div className={cn('overflow-hidden rounded-2xl border', isDark ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-white shadow-sm')}>
      <div className="overflow-x-auto">
        <table className="min-w-[1240px] w-full border-separate border-spacing-0 text-sm">
          <thead className={cn(isDark ? 'bg-white/[0.03] text-white/55' : 'bg-slate-50 text-slate-500')}>
            <tr>
              <th className="px-5 py-4 text-left font-medium">Código</th>
              <th className="px-5 py-4 text-left font-medium">Usuario</th>
              <th className="px-5 py-4 text-left font-medium">Rol</th>
              <th className="px-5 py-4 text-left font-medium">Producto</th>
              <th className="px-5 py-4 text-right font-medium">Stock anterior</th>
              <th className="px-5 py-4 text-right font-medium">Stock nuevo</th>
              <th className="px-5 py-4 text-right font-medium">Cantidad ajustada</th>
              <th className="px-5 py-4 text-left font-medium">Tipo</th>
              <th className="px-5 py-4 text-left font-medium">Motivo</th>
              <th className="px-5 py-4 text-left font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody className={cn(isDark ? 'divide-y divide-white/5' : 'divide-y divide-slate-200')}>
            {rows.map((row) => (
              <tr key={row.ajusteInventarioId} className={cn('transition-colors', isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-100')}>
                <td className="px-5 py-5 align-top">
                  <div className={cn('inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.18em]', isDark ? 'border-white/10 bg-white/[0.04] text-white/55' : 'border-slate-200 bg-slate-100 text-slate-500')}>
                    {row.productoSku}
                  </div>
                </td>
                <td className="px-5 py-5 align-top">
                  <div className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>{row.usuarioNombre}</div>
                  <div className={cn('text-xs', isDark ? 'text-white/45' : 'text-slate-500')}>Responsable</div>
                </td>
                <td className="px-5 py-5 align-top">
                  {row.userRole ? (
                    <Badge
                      variant="secondary"
                      className={cn(
                        row.userRole === 'ADMIN' ? 'bg-purple-600 text-white border-purple-700 dark:bg-purple-500' : 'bg-blue-600 text-white border-blue-700 dark:bg-blue-500',
                        'uppercase text-xs',
                      )}
                    >
                      {row.userRole}
                    </Badge>
                  ) : (
                    <div className={cn('text-xs text-muted-foreground')}>-</div>
                  )}
                </td>
                <td className="px-5 py-5 align-top">
                  <div className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                    {row.productoNombre && row.productoNombre.length > 60 ? (
                      <>
                        <span>{row.productoNombre.slice(0, 60)}… </span>
                        <button
                          className="text-xs text-blue-400 hover:underline"
                          onClick={() => {
                            setPreviewContent(row.productoNombre)
                            setPreviewOpen(true)
                          }}
                        >
                          ver más
                        </button>
                      </>
                    ) : (
                      <span>{row.productoNombre}</span>
                    )}
                  </div>
                    {/* SKU already shown in first column, hide here to avoid duplication */}
                </td>
                <td className={cn('px-5 py-5 align-top text-right', isDark ? 'text-white/70' : 'text-slate-600')}>{formatCompact(row.stockAnterior)}</td>
                <td className={cn('px-5 py-5 align-top text-right', isDark ? 'text-white/70' : 'text-slate-600')}>{formatCompact(row.stockNuevo)}</td>
                <td className={cn('px-5 py-5 align-top text-right font-medium', isDark ? 'text-white' : 'text-slate-900')}>{formatCompact(row.cantidad)}</td>
                <td className="px-5 py-5 align-top">
                  <Badge variant={row.tipoCambio === 'AUMENTO' ? 'success' : 'reduction'}>
                    {row.tipoCambio === 'AUMENTO' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                    {row.tipoCambio}
                  </Badge>
                </td>
                <td className={cn('px-5 py-5 align-top', isDark ? 'text-white/65' : 'text-slate-600')}>
                  {row.motivo && row.motivo.length > 120 ? (
                    <>
                      <span>{row.motivo.slice(0, 120)}… </span>
                      <button
                        className="text-xs text-blue-400 hover:underline"
                        onClick={() => {
                          setPreviewContent(row.motivo)
                          setPreviewOpen(true)
                        }}
                      >
                        ver más
                      </button>
                    </>
                  ) : (
                    <span>{row.motivo}</span>
                  )}
                </td>
                <td className={cn('px-5 py-5 align-top', isDark ? 'text-white/50' : 'text-slate-500')}>{formatDateTime(row.fecha)}</td>
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
  const [startDate, setStartDate] = useState<string | undefined>(undefined)
  const [endDate, setEndDate] = useState<string | undefined>(undefined)
  const [dateError, setDateError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
  const [tipoCambioFilter, setTipoCambioFilter] = useState<'TODOS' | 'AUMENTO' | 'REDUCCION'>('TODOS')
  const queryClient = useQueryClient()
  const theme = useSettingsStore((state) => state.theme)
  const isDark = theme === 'dark'

  const filters = useMemo(() => {
    const trimmedSearch = search.trim()

    // Don't send filters if date range is invalid
    const validDateRange = !dateError

    return {
      page,
      limit: 15,
      ...(trimmedSearch ? { search: trimmedSearch } : {}),
      ...(tipoCambioFilter !== 'TODOS' ? { tipoCambio: tipoCambioFilter } : {}),
      ...(validDateRange && startDate ? { startDate } : {}),
      ...(validDateRange && endDate ? { endDate } : {}),
    }
  }, [page, search, tipoCambioFilter, startDate, endDate, dateError])

  useEffect(() => {
    if (startDate && endDate) {
      const sd = new Date(startDate)
      const ed = new Date(endDate)
      sd.setHours(0, 0, 0, 0)
      ed.setHours(0, 0, 0, 0)
      // Only error if endDate is strictly less than startDate (equal is allowed for single day)
      if (ed.getTime() < sd.getTime()) {
        setDateError('La fecha final debe ser mayor o igual a la fecha inicial')
        toast.error('Error de rango de fechas', {
          description: 'La fecha final debe ser mayor o igual a la fecha inicial',
        })
      } else {
        setDateError(null)
      }
    } else {
      setDateError(null)
    }
  }, [startDate, endDate])

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
        <div className={cn('rounded-2xl border p-6', isDark ? 'border-rose-500/20 bg-rose-500/10' : 'border-rose-200 bg-rose-50')}>
          <h2 className={cn('text-lg font-semibold', isDark ? 'text-rose-300' : 'text-rose-700')}>Error al cargar ajustes</h2>
          <p className={cn('mt-2 text-sm', isDark ? 'text-rose-200/70' : 'text-rose-700/70')}>Revisa la conexión con el backend o tus permisos.</p>
        </div>
      </div>
    )
  }

  const data = query.data

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      {/* Header */}
      <section className={cn('flex items-end justify-between gap-4 border-b pb-6', isDark ? 'border-white/10' : 'border-slate-200')}>
        <div className="space-y-2">
          <div className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium', isDark ? 'border-blue-500/20 bg-blue-500/10 text-blue-200' : 'border-blue-200 bg-blue-50 text-blue-700')}>
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Auditoría de inventario
          </div>
          <h1 className={cn('text-3xl font-semibold tracking-tight', isDark ? 'text-white' : 'text-slate-900')}>Historial de cambios</h1>
          <p className={cn('max-w-2xl text-sm', isDark ? 'text-white/65' : 'text-slate-500')}>Seguimiento completo de ajustes manuales con trazabilidad de usuarios y fechas</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => query.refetch()}
            disabled={query.isRefetching || !!dateError}
            className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all disabled:opacity-50', isDark ? 'border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}
          >
            <RefreshCw className={`h-4 w-4 ${query.isRefetching ? 'animate-spin' : ''}`} />
            Actualizar
          </button>

          <button
            onClick={() => {
              setSearch('')
              setStartDate(undefined)
              setEndDate(undefined)
              setTipoCambioFilter('TODOS')
              setPage(1)
              queryClient.invalidateQueries({ queryKey: ['inventory-adjustments'] })
            }}
            className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all', isDark ? 'border-white/10 bg-white/[0.02] text-white hover:bg-white/[0.04]' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}
          >
            Limpiar filtros
          </button>
        </div>
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
                    ? 'border border-green-500/30 bg-green-500/20 text-green-200'
                    : tipo === 'REDUCCION'
                      ? 'border border-red-500/30 bg-red-500/20 text-red-200'
                      : 'border border-blue-500/30 bg-blue-500/20 text-blue-200'
                  : isDark
                    ? 'border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
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

        <div className="w-full max-w-2xl flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className={cn('pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2', isDark ? 'text-white/35' : 'text-slate-400')} />
            <Input
              value={search}
              onChange={(event) => {
                setPage(1)
                setSearch(event.target.value)
              }}
              placeholder="Buscar producto, usuario o motivo"
              className={cn('h-11 pl-10', isDark ? 'border-white/10 bg-white/5 text-white placeholder:text-white/35' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400')}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                type="date"
                value={startDate ?? ''}
                onChange={(e) => {
                  setStartDate(e.target.value || undefined)
                  setPage(1)
                }}
                className="h-11 w-[12rem]"
                title="Fecha inicial"
                placeholder="Fecha inicial"
              />
            </div>
            <div className="relative">
              <Input
                type="date"
                value={endDate ?? ''}
                onChange={(e) => {
                  setEndDate(e.target.value || undefined)
                  setPage(1)
                }}
                className="h-11 w-[12rem]"
                title="Fecha final"
                placeholder="Fecha final"
              />
            </div>
          </div>
          <div className="ml-2 flex flex-col text-sm">
            {dateError ? (
              <div className={cn('flex items-center gap-1.5 rounded-md px-2 py-1', isDark ? 'bg-red-500/15 text-red-300' : 'bg-red-50 text-red-700')}>
                <AlertCircle className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{dateError}</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Tabla */}
      <section>
        <AdjustmentsTable rows={data.data} />
      </section>

      {/* Paginación elegante integrada */}
      <section className={cn('flex items-center justify-between rounded-2xl border px-6 py-4', isDark ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-white shadow-sm')}>
        <div className={cn('flex items-center gap-2 text-sm', isDark ? 'text-white/60' : 'text-slate-500')}>
          <span className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>{data.total}</span>
          <span>registro{data.total !== 1 ? 's' : ''}</span>
          <span className={cn('mx-2', isDark ? 'text-white/30' : 'text-slate-300')}>•</span>
          <span>Pág. <span className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>{data.page}</span> de <span className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>{data.totalPages}</span></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            disabled={page === 1}
            className={cn('rounded-lg border p-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed', isDark ? 'border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(current + 1, data.totalPages))}
            disabled={page >= data.totalPages}
            className={cn('rounded-lg border p-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed', isDark ? 'border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
      <ModalBase
        open={previewOpen}
        onOpenChange={(v) => setPreviewOpen(v)}
        title="Detalles"
        description="Contenido completo"
        contentClassName="max-w-xl"
      >
        <div className="prose max-w-none break-words text-sm text-slate-800 dark:text-white">
          {previewContent}
        </div>
      </ModalBase>
    </div>
  )
}