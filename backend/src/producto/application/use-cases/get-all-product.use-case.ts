import { Injectable } from '@nestjs/common';
import { ProductoRepository } from '../../domain/repository/producto.repository';
import { Producto } from '../../domain/entity/producto.entity';
import { FiltersProductDTO } from '../dto/filters-product-dto';

@Injectable()
export class GetAllProductosUseCase {
  constructor(private readonly productoRepo: ProductoRepository) {}

  async ejecutar(filters?: FiltersProductDTO): Promise<Producto[]> {
    return this.productoRepo.getAll(filters);
  }
}
