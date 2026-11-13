export type KardexMovementType = 'ENTRADA' | 'SALIDA' | 'AJUSTE'

export type KardexReferenceType = 'COMPRA' | 'VENTA' | 'AJUSTE'

export interface StockValidationResponse {
  isValid: boolean
  currentStock: number
  requestedQuantity: number
  error?: string
}

export interface CreateKardexMovementInput {
  productoId: number
  tipoMovimiento: KardexMovementType
  cantidad: number
  costoUnitario: number
  valorTotal: number
  referenciaId: number
  tipoReferencia: KardexReferenceType
}

export interface KardexMovementResponse {
  kardexId: number
  productoId: number
  tipoMovimiento: KardexMovementType
  cantidad: number
  costoUnitario: number
  valorTotal: number
  referenciaId: number
  tipoReferencia: KardexReferenceType
  fechaMovimiento: string
}

export interface RegisterStockAdjustmentInput {
  productoId: number
  stockAnterior: number
  stockNuevo: number
  motivo: string
}

export interface StockAdjustmentResponse {
  ajusteInventarioId: number
  productoId: number
  usuarioId: number
  cantidad: number
  stockAnterior: number
  stockNuevo: number
  tipoCambio: 'AUMENTO' | 'REDUCCION'
  motivo: string
  fecha: string
}
