import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriaRepository } from '../../domain/repository/categoria.repository';
import { Categoria } from '../../domain/entity/categoria.entity';

@Injectable()
export class UpdateCategoriaUseCase {
  constructor(private readonly categoriaRepo: CategoriaRepository) {}

  async ejecutar(
    categoriaId: number,
    cambios: {
      nombre?: string;
    },
  ): Promise<Categoria> {
    const actual = await this.categoriaRepo.getById(categoriaId);
    if (!actual) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const existingCategories = await this.categoriaRepo.getAll();

    existingCategories.data.forEach((category) => {
      if (
        category.nombre === cambios.nombre &&
        category.categoriaId !== categoriaId
      ) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
    });

    const categoria = new Categoria(
      actual.categoriaId,
      cambios.nombre ?? actual.nombre,
      actual.createdAt,
      new Date(),
    );
    return this.categoriaRepo.update(categoria);
  }
}
