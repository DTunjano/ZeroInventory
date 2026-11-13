const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 2,
})

/** Presentación: conserva los centavos admitidos por el contrato monetario. */
export function formatCOP(value: number): string {
  return copFormatter.format(value)
}
