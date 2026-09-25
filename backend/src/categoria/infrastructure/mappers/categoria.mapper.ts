import { Categoria } from '../../domain/entity/categoria.entity';
import { CategoriaEntityORM } from '../persistence/categoria.orm-entity';

export class CategoriaMapper {
  static toDomain(entity: CategoriaEntityORM): Categoria {
    return new Categoria(
      entity.categoriaId,
      entity.nombre,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: Categoria): CategoriaEntityORM {
    const entity = new CategoriaEntityORM();
    entity.categoriaId = domain.categoriaId;
    entity.nombre = domain.nombre;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
