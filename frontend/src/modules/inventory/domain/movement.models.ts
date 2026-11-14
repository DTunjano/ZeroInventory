export interface InventoryMovement {
  kardexId: number
  productoId: number
  tipoMovimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE'
  cantidad: number
  costoUnitario: number
  valorTotal: number
  referenciaId: number
  tipoReferencia: 'COMPRA' | 'VENTA' | 'AJUSTE' | 'RECEPCION_COMPRA'
  fechaMovimiento: string
}
export interface InventoryMovementPage {
  data: InventoryMovement[]
  total: number
  page: number
  limit: number
  totalPages: number
  stockActual: number
  saldoKardex: number
}
