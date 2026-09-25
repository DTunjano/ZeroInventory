import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriaRepository } from '../../domain/repository/categoria.repository';

@Injectable()
export class DeleteCategoriaUseCase {
  constructor(private readonly categoriaRepo: CategoriaRepository) {}

  async ejecutar(id: number): Promise<void> {
    const deleted = await this.categoriaRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('Categoría no encontrada');
    }
  }
}
