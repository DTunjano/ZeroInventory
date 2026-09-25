import { ConflictException, Injectable } from '@nestjs/common';
import { CategoriaProductoRepository } from '../../domain/repository/categoria-producto.repository';
import { CategoriaProducto } from '../../domain/entity/categoria-producto.entity';

@Injectable()
export class CreateCategoriaProductoUseCase {
  constructor(private readonly categoriaProductoRepo: CategoriaProductoRepository) {}

  async ejecutar(data: {
    categoriaId: number;
    productoId: number;
  }): Promise<CategoriaProducto> {
    const existing = await this.categoriaProductoRepo.getAll();

    existing.data.forEach((cp) => {
      if (cp.categoriaId === data.categoriaId && cp.productoId === data.productoId) {
        throw new ConflictException(
          'Ya existe una relación entre esta categoría y este producto',
        );
      }
    });

    const categoriaProducto = new CategoriaProducto(
      0,
      data.categoriaId,
      data.productoId,
      new Date(),
      new Date(),
    );
    return this.categoriaProductoRepo.create(categoriaProducto);
  }
}
