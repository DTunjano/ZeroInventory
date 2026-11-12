import { Injectable } from '@nestjs/common';
import { CompraDetalleRepository } from '../../domain/repository/compra-detalle.repository';
import { CompraDetalle } from '../../domain/entity/compra-detalle.entity';

@Injectable()
export class CreateCompraDetalleUseCase {
  constructor(private readonly compraDetalleRepo: CompraDetalleRepository) {}

  async ejecutar(data: {
    compraId: number;
    productoId: number;
    cantidad: number;
    costoUnitario: number;
  }): Promise<CompraDetalle> {
    const subtotal = data.cantidad * data.costoUnitario;

    const compraDetalle = new CompraDetalle(
      0,
      data.compraId,
      data.productoId,
      data.cantidad,
      data.costoUnitario,
      subtotal,
    );
    return this.compraDetalleRepo.create(compraDetalle);
  }
}
