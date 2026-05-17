import { TipoMovimientoEnum, TipoReferenciaEnum } from '../../entities/kardex.orm-entity'
import { TipoCambioEnum } from '../../entities/ajuste-inventario.orm-entity'

// Re-exportar con alias para consistency
export type TipoMovimientoKardex = TipoMovimientoEnum
export type TipoReferenciaKardex = TipoReferenciaEnum
export type TipoCambioAjuste = TipoCambioEnum

/** Datos para crear un movimiento en Kárdex */
export interface CreateKardexMovementData {
  productoId: number
  tipoMovimiento: TipoMovimientoKardex
  cantidad: number
  costoUnitario: number
  valorTotal: number
  referenciaId: number
  tipoReferencia: TipoReferenciaKardex
}

/** Datos para registrar un ajuste de inventario */
export interface RegisterStockAdjustmentData {
  productoId: number
  usuarioId: number
  cantidad: number
  stockAnterior: number
  stockNuevo: number
  motivo: string
}

/** Resultado de una validación de stock */
export interface StockValidationResult {
  isValid: boolean
  currentStock: number
  requestedQuantity: number
  error?: string
}

/** Movimiento de Kárdex (dominio) */
export interface KardexMovement {
  kardexId: number
  productoId: number
  tipoMovimiento: TipoMovimientoKardex
  cantidad: number
  costoUnitario: number
  valorTotal: number
  referenciaId: number
  tipoReferencia: TipoReferenciaKardex
  fechaMovimiento: Date
}

/** Ajuste de inventario (dominio) */
export interface StockAdjustment {
  ajusteInventarioId: number
  productoId: number
  usuarioId: number
  cantidad: number
  stockAnterior: number
  stockNuevo: number
  tipoCambio: TipoCambioAjuste
  motivo: string
  fecha: Date
}

export interface StockAdjustmentListItem extends StockAdjustment {
  productoNombre: string
  productoSku: string
  usuarioNombre: string
  userRole?: string | null
  userFirstName: string | null
  userLastName: string | null
}

export interface PaginatedStockAdjustments {
  data: StockAdjustmentListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface StockAdjustmentPageFilters {
  page: number
  limit: number
  productoId?: number
  usuarioId?: number
  tipoCambio?: TipoCambioAjuste
  search?: string
  // Fecha inicio (inclusive) y fin (inclusive)
  startDate?: string
  endDate?: string
}
