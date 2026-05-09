import { Injectable } from '@nestjs/common';
import { CategoriaProductoRepository } from '../../domain/repository/categoria-producto.repository';
import { CategoriaProducto } from '../../domain/entity/categoria-producto.entity';

@Injectable()
export class GetCategoriaProductoByIdUseCase {
  constructor(private readonly categoriaProductoRepo: CategoriaProductoRepository) {}

  async ejecutar(id: number): Promise<CategoriaProducto | null> {
    return this.categoriaProductoRepo.getById(id);
  }
}
