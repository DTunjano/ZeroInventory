import { ConflictException, Injectable } from '@nestjs/common';
import { CarritoDetalleRepository } from '../../domain/repository/carrito-detalle.repository';
import { CarritoDetalle } from '../../domain/entity/carrito-detalle.entity';

@Injectable()
export class CreateCarritoDetalleUseCase {
  constructor(private readonly carritoDetalleRepo: CarritoDetalleRepository) {}

  async ejecutar(data: {
    carritoId: number;
    productoId: number;
    cantidad: number;
  }): Promise<CarritoDetalle> {
    const existingCarritoDetalle =
      await this.carritoDetalleRepo.getByCarritoIdAndProductoId(
        data.carritoId,
        data.productoId,
      );
    if (existingCarritoDetalle) {
      throw new ConflictException(
        'El producto ya existe en el carrito. Actualiza la cantidad en su lugar.',
      );
    }

    const carritoDetalle = new CarritoDetalle(
      0,
      data.carritoId,
      data.productoId,
      data.cantidad,
      new Date(),
      new Date(),
    );
    return this.carritoDetalleRepo.create(carritoDetalle);
  }
}
