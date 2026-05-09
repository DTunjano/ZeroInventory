import { FiltersProductoImagenDTO } from '../../application/dto/filters-producto-imagen-dto';
import { ProductoImagen } from '../entity/producto-imagen.entity';

export abstract class ProductoImagenRepository {
  abstract create(productoImagen: ProductoImagen): Promise<ProductoImagen>;
  abstract getById(imagenProductoId: number): Promise<ProductoImagen | null>;
  abstract getAll(filters?: FiltersProductoImagenDTO): Promise<{
    data: ProductoImagen[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract update(productoImagen: ProductoImagen): Promise<ProductoImagen>;
  abstract delete(imagenProductoId: number): Promise<boolean>;
  abstract deleteByProductoId(productoId: number): Promise<boolean>;
}
