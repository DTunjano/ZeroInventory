import { Injectable } from '@nestjs/common';
import { ProductoRepository } from '../../domain/repository/producto.repository';
import { Producto } from '../../domain/entity/producto.entity';

@Injectable()
export class GetProductByIdUseCase {
  constructor(private readonly productoRepo: ProductoRepository) {}

  async ejecutar(id: number): Promise<Producto | null> {
    return this.productoRepo.getById(id);
  }
}
