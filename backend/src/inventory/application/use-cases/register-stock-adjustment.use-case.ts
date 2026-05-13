import { Inject, Injectable } from '@nestjs/common'
import type {
  RegisterStockAdjustmentData,
  StockAdjustment,
} from '../../domain/inventory.types'
import type { IStockAdjustmentRepository } from '../../domain/stock-adjustment.repository'

/**
 * Use case: Registrar ajuste de inventario
 *
 * Responsabilidad:
 * - Calcular tipo de cambio (AUMENTO | REDUCCION)
 * - Registrar auditoría completa
 * - Persistir en base de datos
 *
 * Ejemplo:
 * Stock anterior: 100
 * Stock nuevo: 150
 * -> cantidad = 50, tipoCambio = AUMENTO
 */
@Injectable()
export class RegisterStockAdjustmentUseCase {
  constructor(
    @Inject('IStockAdjustmentRepository')
    private readonly adjustmentRepository: IStockAdjustmentRepository,
  ) {}

  async ejecutar(
    usuarioId: number,
    data: {
      productoId: number
      stockAnterior: number
      stockNuevo: number
      motivo: string
    },
  ): Promise<StockAdjustment> {
    // Calcular cantidad del ajuste. El tipo de cambio se determina en infraestructura.
    const diferencia = data.stockNuevo - data.stockAnterior
    const cantidad = Math.abs(diferencia)

    const adjustmentData: RegisterStockAdjustmentData = {
      productoId: data.productoId,
      usuarioId,
      cantidad,
      stockAnterior: data.stockAnterior,
      stockNuevo: data.stockNuevo,
      motivo: data.motivo,
    }

    return this.adjustmentRepository.registerAdjustment(adjustmentData)
  }
}
