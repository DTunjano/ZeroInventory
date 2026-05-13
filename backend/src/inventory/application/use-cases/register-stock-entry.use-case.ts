import { Injectable } from '@nestjs/common'

import { TipoMovimientoEnum, TipoReferenciaEnum } from '../../../entities/kardex.orm-entity'
import type { KardexMovement, TipoReferenciaKardex } from '../../domain/inventory.types'
import { CreateKardexMovementUseCase } from './create-kardex-movement.use-case'

@Injectable()
export class RegisterStockEntryUseCase {
  constructor(private readonly createKardexMovementUseCase: CreateKardexMovementUseCase) {}

  async ejecutar(data: {
    productoId: number
    cantidad: number
    costoUnitario: number
    referenciaId: number
    tipoReferencia?: TipoReferenciaKardex
  }): Promise<KardexMovement> {
    return this.createKardexMovementUseCase.ejecutar({
      productoId: data.productoId,
      tipoMovimiento: TipoMovimientoEnum.ENTRADA,
      cantidad: data.cantidad,
      costoUnitario: data.costoUnitario,
      valorTotal: data.cantidad * data.costoUnitario,
      referenciaId: data.referenciaId,
      tipoReferencia: data.tipoReferencia ?? TipoReferenciaEnum.COMPRA,
    })
  }
}