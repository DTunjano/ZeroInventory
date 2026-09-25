import { FiltersProductDTO } from '../../application/dto/filters-product-dto';
import { Producto } from '../entity/producto.entity';

export abstract class ProductoRepository {
  abstract create(producto: Producto): Promise<Producto>;
  abstract getById(productoId: number): Promise<Producto | null>;
  abstract update(producto: Producto): Promise<Producto>;
  abstract delete(productoId: number): Promise<boolean>;
  abstract getAll(filters?: FiltersProductDTO): Promise<{
    data: Producto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract existsByNombre(
    nombre: string,
    excludeProductoId?: number,
  ): Promise<boolean>;
  abstract existsBySku(sku: string): Promise<boolean>;
}
