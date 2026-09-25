import { Injectable } from '@nestjs/common';
import { CompraRepository } from '../../domain/repository/compra.repository';
import { Compra } from '../../domain/entity/compra.entity';
import { FilterCompraDTO } from '../dto/filters-compra-dto';

@Injectable()
export class GetAllComprasUseCase {
  constructor(private readonly compraRepo: CompraRepository) {}

  async ejecutar(filters?: FilterCompraDTO): Promise<{
    data: Compra[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.compraRepo.getAll(filters);
  }
}
