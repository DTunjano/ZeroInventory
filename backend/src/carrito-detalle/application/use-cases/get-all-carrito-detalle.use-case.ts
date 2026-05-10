import { Injectable } from '@nestjs/common';
import { CarritoDetalleRepository } from '../../domain/repository/carrito-detalle.repository';
import { CarritoDetalle } from '../../domain/entity/carrito-detalle.entity';
import { FiltersCarritoDetalleDTO } from '../dto/filters-carrito-detalle-dto';

@Injectable()
export class GetAllCarritoDetallesUseCase {
  constructor(private readonly carritoDetalleRepo: CarritoDetalleRepository) {}

  async ejecutar(filters?: FiltersCarritoDetalleDTO): Promise<{
    data: CarritoDetalle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.carritoDetalleRepo.getAll(filters);
  }
}
