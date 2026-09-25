import { Injectable, NotFoundException } from '@nestjs/common';
import { CarritoDetalleRepository } from '../../domain/repository/carrito-detalle.repository';
import { CarritoDetalle } from '../../domain/entity/carrito-detalle.entity';

@Injectable()
export class UpdateCarritoDetalleUseCase {
  constructor(private readonly carritoDetalleRepo: CarritoDetalleRepository) {}

  async ejecutar(
    carritoDetalleId: number,
    cambios: {
      cantidad?: number;
    },
  ): Promise<CarritoDetalle> {
    const actual = await this.carritoDetalleRepo.getById(carritoDetalleId);
    if (!actual) {
      throw new NotFoundException('Detalle de carrito no encontrado');
    }

    const carritoDetalle = new CarritoDetalle(
      actual.carritoDetalleId,
      actual.carritoId,
      actual.productoId,
      cambios.cantidad ?? actual.cantidad,
      actual.createdAt,
      new Date(),
    );
    return this.carritoDetalleRepo.update(carritoDetalle);
  }
}
