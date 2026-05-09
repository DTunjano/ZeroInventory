import { CategoriaProducto } from '../../domain/entity/categoria-producto.entity';
import { CategoriaProductoEntityORM } from '../persistence/categoria-producto.orm-entity';

export class CategoriaProductoMapper {
  static toDomain(entity: CategoriaProductoEntityORM): CategoriaProducto {
    return new CategoriaProducto(
      entity.categoriaProductoId,
      entity.categoriaId,
      entity.productoId,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: CategoriaProducto): CategoriaProductoEntityORM {
    const entity = new CategoriaProductoEntityORM();
    entity.categoriaProductoId = domain.categoriaProductoId;
    entity.categoriaId = domain.categoriaId;
    entity.productoId = domain.productoId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
