import { Injectable, NotFoundException } from '@nestjs/common';
import { CarritoDetalleRepository } from '../../domain/repository/carrito-detalle.repository';

@Injectable()
export class DeleteCarritoDetalleUseCase {
  constructor(private readonly carritoDetalleRepo: CarritoDetalleRepository) {}

  async ejecutar(id: number): Promise<void> {
    const deleted = await this.carritoDetalleRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('Detalle de carrito no encontrado');
    }
  }
}
