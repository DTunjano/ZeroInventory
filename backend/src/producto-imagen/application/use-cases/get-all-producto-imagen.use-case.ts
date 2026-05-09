import { Injectable } from '@nestjs/common';
import { ProductoImagenRepository } from '../../domain/repository/producto-imagen.repository';
import { ProductoImagen } from '../../domain/entity/producto-imagen.entity';
import { FiltersProductoImagenDTO } from '../dto/filters-producto-imagen-dto';

@Injectable()
export class GetAllProductoImagenUseCase {
  constructor(private readonly productoImagenRepo: ProductoImagenRepository) {}

  async ejecutar(filters?: FiltersProductoImagenDTO): Promise<{
    data: ProductoImagen[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.productoImagenRepo.getAll(filters);
  }
}
