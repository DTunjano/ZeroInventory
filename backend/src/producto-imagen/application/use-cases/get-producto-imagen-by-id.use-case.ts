import { Injectable } from '@nestjs/common';
import { ProductoImagenRepository } from '../../domain/repository/producto-imagen.repository';
import { ProductoImagen } from '../../domain/entity/producto-imagen.entity';

@Injectable()
export class GetProductoImagenByIdUseCase {
  constructor(private readonly productoImagenRepo: ProductoImagenRepository) {}

  async ejecutar(id: number): Promise<ProductoImagen | null> {
    return this.productoImagenRepo.getById(id);
  }
}
