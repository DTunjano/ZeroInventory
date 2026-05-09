import { Injectable } from '@nestjs/common';
import { CategoriaProductoRepository } from '../../domain/repository/categoria-producto.repository';
import { CategoriaProducto } from '../../domain/entity/categoria-producto.entity';
import { FiltersCategoriaProductoDTO } from '../dto/filters-categoria-producto-dto';

@Injectable()
export class GetAllCategoriaProductosUseCase {
  constructor(private readonly categoriaProductoRepo: CategoriaProductoRepository) {}

  async ejecutar(filters?: FiltersCategoriaProductoDTO): Promise<{
    data: CategoriaProducto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.categoriaProductoRepo.getAll(filters);
  }
}
