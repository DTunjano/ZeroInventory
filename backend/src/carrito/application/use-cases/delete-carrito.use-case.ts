import { Injectable, NotFoundException } from '@nestjs/common';
import { CarritoRepository } from '../../domain/repository/carrito.repository';

@Injectable()
export class DeleteCarritoUseCase {
  constructor(private readonly carritoRepo: CarritoRepository) {}

  async ejecutar(id: number): Promise<void> {
    const deleted = await this.carritoRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('Carrito no encontrado');
    }
  }
}
