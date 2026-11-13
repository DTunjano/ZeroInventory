import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getReports } from '../application/reports.use-cases'
import { reportsCsv } from '../application/report-csv'
import { useAuthStore } from '@/modules/auth/application/auth.store'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { formatCOP } from '@/shared/lib/currency'
import { getApiErrorMessage } from '@/shared/lib/api-error'

function initialPeriod() {
  const dateTo = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  return { dateFrom: `${dateTo.slice(0, 7)}-01`, dateTo }
}
const stateNames: Record<string, string> = { CONFIRMADO: 'Confirmados', COMPLETADO: 'Completados', ENVIADO: 'Enviados', CANCELADO: 'Cancelados', DEVUELTO: 'Devueltos' }

function ReportTable({ title, headers, rows }: { title: string; headers: string[]; rows: ReactNode[][] }) {
  return <section className="min-w-0 rounded-xl border bg-card p-4">
    <h2 className="mb-3 text-lg font-semibold">{title}</h2>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm">
      <caption className="sr-only">{title}</caption>
      <thead><tr>{headers.map((header) => <th scope="col" key={header} className="border-b p-2">{header}</th>)}</tr></thead>
      <tbody>{rows.length ? rows.map((row, index) => <tr key={index}>{row.map((value, cell) => <td key={cell} className="border-b p-2 last:whitespace-nowrap">{value}</td>)}</tr>) : <tr><td colSpan={headers.length} className="p-4 text-muted-foreground">Sin registros para mostrar.</td></tr>}</tbody>
    </table></div>
  </section>
}

export function ReportsPage() {
  const userId = useAuthStore((state) => state.user?.usuarioId)
  const [period, setPeriod] = useState(initialPeriod)
  const [draft, setDraft] = useState(initialPeriod)
  const [validation, setValidation] = useState('')
  const report = useQuery({ queryKey: ['reports', userId, period.dateFrom, period.dateTo], queryFn: () => getReports(period) })
  const data = report.data
  function download() {
    if (!data) return
    const url = URL.createObjectURL(new Blob([reportsCsv(data)], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url; link.download = `zeroinventory-reportes-${data.period.dateFrom}_${data.period.dateTo}.csv`
    link.click(); URL.revokeObjectURL(url)
  }
  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Reportes avanzados</h1><p className="text-sm text-muted-foreground">Consulta operativa de pedidos, pagos internos e inventario.</p></div><Button variant="outline" disabled={!data || report.isFetching || report.isError} onClick={download}>Exportar CSV</Button></div>
    <form className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4" onSubmit={(event) => {
      event.preventDefault()
      if (!draft.dateFrom || !draft.dateTo || draft.dateFrom > draft.dateTo) { setValidation('Selecciona fechas válidas; Desde no puede ser posterior a Hasta.'); return }
      setValidation(''); setPeriod(draft)
    }}>
      <div><Label htmlFor="report-from">Desde</Label><Input id="report-from" type="date" required value={draft.dateFrom} onChange={(event) => setDraft({ ...draft, dateFrom: event.target.value })} /></div>
      <div><Label htmlFor="report-to">Hasta</Label><Input id="report-to" type="date" required value={draft.dateTo} onChange={(event) => setDraft({ ...draft, dateTo: event.target.value })} /></div>
      <Button type="submit" disabled={report.isFetching}>Consultar</Button>
      <Button type="button" variant="outline" disabled={report.isFetching} onClick={() => void report.refetch()}>Actualizar</Button>
      {validation && <p role="alert" className="w-full text-sm text-destructive">{validation}</p>}
    </form>
    <p className="text-sm text-muted-foreground">Máximo 366 días. Fechas calendario del registro en la DB; la fecha final incluye todo el día. Los pagos aprobados son registros internos, no confirmación de liquidación bancaria.</p>
    {report.isFetching && <p role="status">Consultando reportes…</p>}
    {report.isError && <p role="alert" className="rounded-xl border border-destructive p-4">{getApiErrorMessage(report.error, 'No se pudieron consultar los reportes')}</p>}
    {data && !report.isError && <>
      <p className="text-sm">Período consultado: {data.period.dateFrom} al {data.period.dateTo}</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
        ['Pedidos registrados', String(data.summary.orders)], ['Total de pedidos', formatCOP(data.summary.orderTotal)],
        ['Pagos aprobados registrados', formatCOP(data.summary.approvedPayments)], ['Pagos pendientes registrados', formatCOP(data.summary.pendingPayments)],
      ].map(([label, value]) => <div key={label} className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}</div>
      <p className="text-sm text-muted-foreground">Pedidos según fecha de creación; pagos según fecha del registro de pago. El total de pedidos incluye todos sus estados y no equivale a ingresos.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <ReportTable title="Pedidos por día" headers={['Fecha', 'Pedidos', 'Total']} rows={data.daily.map((row) => [row.date, row.orders, formatCOP(row.total)])} />
        <ReportTable title="Pedidos por estado" headers={['Estado', 'Pedidos', 'Total']} rows={data.states.map((row) => [stateNames[row.state] ?? row.state, row.orders, formatCOP(row.total)])} />
        <ReportTable title="Pagos aprobados por método" headers={['Método', 'Registros', 'Monto']} rows={data.methods.map((row) => [row.method === 'EFECTIVO' ? 'Efectivo' : 'Transferencia', row.payments, formatCOP(row.amount)])} />
        <ReportTable title="Productos más pedidos" headers={['Producto', 'Unidades', 'Total']} rows={data.topProducts.map((row) => [row.name, row.units, formatCOP(row.total)])} />
      </div>
      <p className="text-sm text-muted-foreground">Productos de pedidos confirmados, completados o enviados; excluye cancelados y devueltos. Máximo 10 productos.</p>
      <section className="space-y-3"><h2 className="text-lg font-semibold">Inventario actual</h2><p className="text-sm text-muted-foreground">Independiente del período: {data.inventory.activeProducts} productos activos, {data.inventory.units} unidades. Hasta 10 productos con stock menor o igual a {data.inventory.lowStockThreshold}.</p><ReportTable title="Productos con stock bajo o agotado" headers={['SKU', 'Producto', 'Stock']} rows={data.inventory.lowStock.map((row) => [row.sku, row.name, row.quantity])} /></section>
    </>}
  </div>
}
