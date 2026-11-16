import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import type { StockValidationResult } from '../../domain/inventory.types'
import type { IKardexRepository } from '../../domain/kardex.repository'

/**
 * Use case: Validar disponibilidad de stock
 *
 * Responsabilidad:
 * - Consultar balance disponible desde Kardex
 * - Validar que cantidad solicitada no exceda disponible
 * - Prevenir stock negativo
 *
 * Nota: El stock viene del balanceen Kardex (ENTRADAS - SALIDAS - AJUSTES)
 * No usar campo cantidad de producto directamente si está desincronizado
 */
@Injectable()
export class ValidateStockUseCase {
  constructor(
    @Inject('IKardexRepository')
    private readonly kardexRepository: IKardexRepository,
  ) {}

  async ejecutar(productoId: number, cantidadSolicitada: number): Promise<StockValidationResult> {
    if (cantidadSolicitada <= 0) {
      throw new BadRequestException('La cantidad solicitada debe ser positiva')
    }

    const currentStock = await this.kardexRepository.getProductStockBalance(productoId)

    if (cantidadSolicitada > currentStock) {
      return {
        isValid: false,
        currentStock,
        requestedQuantity: cantidadSolicitada,
        error: `Stock insuficiente. Disponible: ${currentStock}, Solicitado: ${cantidadSolicitada}`,
      }
    }

    return {
      isValid: true,
      currentStock,
      requestedQuantity: cantidadSolicitada,
    }
  }
}
