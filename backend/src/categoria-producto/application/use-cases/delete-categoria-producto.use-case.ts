import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriaProductoRepository } from '../../domain/repository/categoria-producto.repository';

@Injectable()
export class DeleteCategoriaProductoUseCase {
  constructor(private readonly categoriaProductoRepo: CategoriaProductoRepository) {}

  async ejecutar(id: number): Promise<void> {
    const deleted = await this.categoriaProductoRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('Relación categoría-producto no encontrada');
    }
  }
}
