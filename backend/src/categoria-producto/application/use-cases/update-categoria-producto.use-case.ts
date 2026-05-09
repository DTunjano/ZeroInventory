import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriaProductoRepository } from '../../domain/repository/categoria-producto.repository';
import { CategoriaProducto } from '../../domain/entity/categoria-producto.entity';

@Injectable()
export class UpdateCategoriaProductoUseCase {
  constructor(private readonly categoriaProductoRepo: CategoriaProductoRepository) {}

  async ejecutar(
    categoriaProductoId: number,
    cambios: {
      categoriaId?: number;
      productoId?: number;
    },
  ): Promise<CategoriaProducto> {
    const actual = await this.categoriaProductoRepo.getById(categoriaProductoId);
    if (!actual) {
      throw new NotFoundException('Relación categoría-producto no encontrada');
    }

    const existingCategoriaProductos = await this.categoriaProductoRepo.getAll();

    existingCategoriaProductos.data.forEach((cp) => {
      if (
        cp.categoriaId === cambios.categoriaId &&
        cp.productoId === cambios.productoId &&
        cp.categoriaProductoId !== categoriaProductoId
      ) {
        throw new ConflictException(
          'Ya existe una relación entre esta categoría y este producto',
        );
      }
    });

    const categoriaProducto = new CategoriaProducto(
      actual.categoriaProductoId,
      cambios.categoriaId ?? actual.categoriaId,
      cambios.productoId ?? actual.productoId,
      actual.createdAt,
      new Date(),
    );
    return this.categoriaProductoRepo.update(categoriaProducto);
  }
}
