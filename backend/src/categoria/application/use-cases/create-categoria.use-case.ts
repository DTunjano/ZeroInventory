import { ConflictException, Injectable } from '@nestjs/common';
import { CategoriaRepository } from '../../domain/repository/categoria.repository';
import { Categoria } from '../../domain/entity/categoria.entity';

@Injectable()
export class CreateCategoriaUseCase {
  constructor(private readonly categoriaRepo: CategoriaRepository) {}

  async ejecutar(data: { nombre: string }): Promise<Categoria> {
    if (await this.categoriaRepo.existsByNombre(data.nombre)) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    const categoria = new Categoria(0, data.nombre, new Date(), new Date());
    return this.categoriaRepo.create(categoria);
  }
}
