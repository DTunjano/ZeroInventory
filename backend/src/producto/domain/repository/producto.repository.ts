import { FiltersProductDTO } from '../../application/dto/filters-product-dto';
import { Producto } from '../entity/producto.entity';

export abstract class ProductoRepository {
  abstract create(producto: Producto): Promise<Producto>;
  abstract getById(productoId: number): Promise<Producto | null>;
  abstract getAll(filters?: FiltersProductDTO): Promise<Producto[]>;
  abstract update(producto: Producto): Promise<Producto>;
  abstract delete(productoId: number): Promise<boolean>;
}
