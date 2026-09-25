import { Injectable } from '@nestjs/common';
import { CarritoRepository } from '../../domain/repository/carrito.repository';
import { Carrito } from '../../domain/entity/carrito.entity';
import { FiltersCarritoDTO } from '../dto/filters-carrito-dto';

@Injectable()
export class GetAllCarritosUseCase {
  constructor(private readonly carritoRepo: CarritoRepository) {}

  async ejecutar(filters?: FiltersCarritoDTO): Promise<{
    data: Carrito[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.carritoRepo.getAll(filters);
  }
}
