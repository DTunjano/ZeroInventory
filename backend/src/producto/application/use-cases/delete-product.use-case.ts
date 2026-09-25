import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductoRepository } from '../../domain/repository/producto.repository';

@Injectable()
export class DeleteProductUseCase {
  constructor(private readonly productoRepo: ProductoRepository) {}

  async ejecutar(id: number): Promise<void> {
    const deleted = await this.productoRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('Producto no encontrado');
    }
  }
}
