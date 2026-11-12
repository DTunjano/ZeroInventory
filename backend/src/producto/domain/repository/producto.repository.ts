import { FiltersProductDTO } from '../../application/dto/filters-product-dto';
import { Producto } from '../entity/producto.entity';

export abstract class ProductoRepository {
  abstract create(producto: Producto, categoriaIds: number[]): Promise<Producto>;
  abstract getById(productoId: number): Promise<Producto | null>;
  abstract getByIds(productoIds: number[]): Promise<Producto[]>;
  abstract update(producto: Producto, stockChange?: {
    usuarioId: number; expectedStock: number; changeStock: boolean;
  }, categoriaIds?: number[]): Promise<Producto>;
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
  abstract existsBySku(sku: string, excludeProductoId?: number): Promise<boolean>;
}
