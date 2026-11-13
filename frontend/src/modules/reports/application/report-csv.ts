import type { ReportsSnapshot } from '../domain/report.models'

export function csvCell(value: string | number): string {
  // Imported names may start with a spreadsheet formula, even inside CSV quotes.
  const text = String(value)
  const safe = typeof value === 'string' && /^[\s]*[=+@-]|^[\t\r\n]/.test(text) ? `'${text}` : text
  return `"${safe.replaceAll('"', '""')}"`
}

export function reportsCsv(report: ReportsSnapshot): string {
  const rows: (string | number)[][] = [
    ['ZeroInventory — reportes operativos', report.period.dateFrom, report.period.dateTo],
    ['Métrica', 'Valor COP / cantidad'],
    ['Pedidos registrados', report.summary.orders], ['Total de pedidos', report.summary.orderTotal],
    ['Pagos internos aprobados', report.summary.approvedPayments], ['Pagos internos pendientes', report.summary.pendingPayments],
    [], ['Fecha de pedido', 'Pedidos', 'Total COP'], ...report.daily.map((row) => [row.date, row.orders, row.total]),
    [], ['Estado de pedido', 'Pedidos', 'Total COP'], ...report.states.map((row) => [row.state, row.orders, row.total]),
    [], ['Método de pago aprobado', 'Registros', 'Monto COP'], ...report.methods.map((row) => [row.method, row.payments, row.amount]),
    [], ['Producto pedido', 'Unidades', 'Total COP'], ...report.topProducts.map((row) => [row.name, row.units, row.total]),
    [], ['Inventario actual', 'Cantidad'], ['Productos activos', report.inventory.activeProducts], ['Unidades activas', report.inventory.units],
    ['SKU con stock bajo', 'Producto', 'Stock actual'], ...report.inventory.lowStock.map((row) => [row.sku, row.name, row.quantity]),
  ]
  return '\uFEFF' + rows.map((row) => row.map(csvCell).join(';')).join('\r\n')
}
