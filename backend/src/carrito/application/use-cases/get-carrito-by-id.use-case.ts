import { Injectable } from '@nestjs/common';
import { CarritoRepository } from '../../domain/repository/carrito.repository';
import { Carrito } from '../../domain/entity/carrito.entity';

@Injectable()
export class GetCarritoByIdUseCase {
  constructor(private readonly carritoRepo: CarritoRepository) {}

  async ejecutar(id: number): Promise<Carrito | null> {
    return this.carritoRepo.getById(id);
  }
}
