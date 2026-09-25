import { FiltersCategoriaProductoDTO } from '../../application/dto/filters-categoria-producto-dto';
import { CategoriaProducto } from '../entity/categoria-producto.entity';

export abstract class CategoriaProductoRepository {
  abstract create(
    categoriaProducto: CategoriaProducto,
  ): Promise<CategoriaProducto>;
  abstract getById(
    categoriaProductoId: number,
  ): Promise<CategoriaProducto | null>;
  abstract update(
    categoriaProducto: CategoriaProducto,
  ): Promise<CategoriaProducto>;
  abstract delete(categoriaProductoId: number): Promise<boolean>;
  abstract getAll(filters?: FiltersCategoriaProductoDTO): Promise<{
    data: CategoriaProducto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
