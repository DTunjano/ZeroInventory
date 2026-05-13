import { Inject, Injectable } from '@nestjs/common'
import type { CreateKardexMovementData, KardexMovement } from '../../domain/inventory.types'
import type { IKardexRepository } from '../../domain/kardex.repository'

/**
 * Use case: Crear movimiento en Kárdex
 *
 * Responsabilidad:
 * - Persistir movimiento de inventario
 * - Registrar ENTRADA, SALIDA o AJUSTE
 * - Mantener trazabilidad de referencias (pedido, venta, etc)
 *
 * Ejemplo:
 * Cuando se completa una venta exitosa:
 * - tipo: SALIDA
 * - tipoReferencia: VENTA
 * - referenciaId: pedidoId
 */
@Injectable()
export class CreateKardexMovementUseCase {
  constructor(
    @Inject('IKardexRepository')
    private readonly kardexRepository: IKardexRepository,
  ) {}

  async ejecutar(data: CreateKardexMovementData): Promise<KardexMovement> {
    // Validaciones básicas (las más complejas van en domain services)
    if (data.cantidad <= 0) {
      throw new Error('La cantidad debe ser positiva')
    }

    if (data.valorTotal !== data.cantidad * data.costoUnitario) {
      throw new Error('El valor total no coincide con cantidad * costo unitario')
    }

    return this.kardexRepository.createMovement(data)
  }
}
