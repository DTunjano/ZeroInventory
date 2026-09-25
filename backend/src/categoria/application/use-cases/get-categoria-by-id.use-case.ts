import { Injectable } from '@nestjs/common';
import { CategoriaRepository } from '../../domain/repository/categoria.repository';
import { Categoria } from '../../domain/entity/categoria.entity';

@Injectable()
export class GetCategoriaByIdUseCase {
  constructor(private readonly categoriaRepo: CategoriaRepository) {}

  async ejecutar(id: number): Promise<Categoria | null> {
    return this.categoriaRepo.getById(id);
  }
}
