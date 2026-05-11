import { Injectable } from '@nestjs/common';
import { KardexRepository } from '../../domain/repository/kardex.repository';
import {
  Kardex,
  TipoMovimientoEnum,
  TipoReferenciaEnum,
} from '../../domain/entity/kardex.entity';

@Injectable()
export class UpdateKardexUseCase {
  constructor(private readonly kardexRepository: KardexRepository) {}

  async execute(
    kardexId: number,
    data: {
      productoId?: number;
      tipoMovimiento?: TipoMovimientoEnum;
      cantidad?: number;
      costoUnitario?: number;
      referenciaId?: number;
      tipoReferencia?: TipoReferenciaEnum;
    },
  ): Promise<Kardex> {
    const actual = await this.kardexRepository.getById(kardexId);
    if (!actual) {
      throw new Error('Kardex no encontrado');
    }

    const valorTotal =
      (data.cantidad ?? actual.cantidad) *
      (data.costoUnitario ?? actual.costoUnitario);

    const updated = new Kardex(
      actual.kardexId,
      data.productoId ?? actual.productoId,
      data.tipoMovimiento ?? actual.tipoMovimiento,
      data.cantidad ?? actual.cantidad,
      data.costoUnitario ?? actual.costoUnitario,
      valorTotal,
      data.referenciaId ?? actual.referenciaId,
      data.tipoReferencia ?? actual.tipoReferencia,
      new Date(),
    );
    return this.kardexRepository.update(updated);
  }
}
