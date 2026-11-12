import { Injectable } from '@nestjs/common';
import { CompraDetalleRepository } from '../../domain/repository/compra-detalle.repository';
import { CompraDetalle } from '../../domain/entity/compra-detalle.entity';
import { FilterCompraDetalleDTO } from '../dto/filters-compra-detalle-dto';

@Injectable()
export class GetAllCompraDetallesUseCase {
  constructor(private readonly compraDetalleRepo: CompraDetalleRepository) {}

  async ejecutar(filters?: FilterCompraDetalleDTO): Promise<{
    data: CompraDetalle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.compraDetalleRepo.getAll(filters);
  }
}
