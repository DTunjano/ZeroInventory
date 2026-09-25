import { Injectable, NotFoundException } from '@nestjs/common';
import { CompraDetalleRepository } from '../../domain/repository/compra-detalle.repository';
import { CompraDetalle } from '../../domain/entity/compra-detalle.entity';

@Injectable()
export class UpdateCompraDetalleUseCase {
  constructor(private readonly compraDetalleRepo: CompraDetalleRepository) {}

  async ejecutar(
    compraDetalleId: number,
    cambios: {
      cantidad?: number;
      costoUnitario?: number;
    },
  ): Promise<CompraDetalle> {
    const actual = await this.compraDetalleRepo.getById(compraDetalleId);
    if (!actual) {
      throw new NotFoundException('Detalle de compra no encontrado');
    }

    const subtotal =
      (cambios.cantidad ?? actual.cantidad) *
      (cambios.costoUnitario ?? actual.costoUnitario);

    const compraDetalle = new CompraDetalle(
      actual.compraDetalleId,
      actual.compraId,
      actual.productoId,
      cambios.cantidad ?? actual.cantidad,
      cambios.costoUnitario ?? actual.costoUnitario,
      subtotal,
    );
    return this.compraDetalleRepo.update(compraDetalle);
  }
}
