import { Injectable } from '@nestjs/common';
import { CarritoDetalleRepository } from '../../domain/repository/carrito-detalle.repository';
import { CarritoDetalle } from '../../domain/entity/carrito-detalle.entity';

@Injectable()
export class GetCarritoDetalleByIdUseCase {
  constructor(private readonly carritoDetalleRepo: CarritoDetalleRepository) {}

  async ejecutar(id: number): Promise<CarritoDetalle | null> {
    return this.carritoDetalleRepo.getById(id);
  }
}
