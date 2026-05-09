import { Injectable } from '@nestjs/common';
import { CategoriaRepository } from '../../domain/repository/categoria.repository';
import { Categoria } from '../../domain/entity/categoria.entity';
import { FiltersCategoriaDTO } from '../dto/filters-categoria-dto';

@Injectable()
export class GetAllCategoriasUseCase {
  constructor(private readonly categoriaRepo: CategoriaRepository) {}

  async ejecutar(filters?: FiltersCategoriaDTO): Promise<{
    data: Categoria[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.categoriaRepo.getAll(filters);
  }
}
