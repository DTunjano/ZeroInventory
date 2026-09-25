import { Rol } from '../../domain/entity/rol.entity';
import { RolEntityORM } from '../persistence/rol.orm-entity';

export class RolMapper {
  static toDomain(entity: RolEntityORM): Rol {
    return new Rol(entity.rolId, entity.nombre);
  }

  static toPersistence(domain: Rol): RolEntityORM {
    const entity = new RolEntityORM();
    entity.rolId = domain.rolId;
    entity.nombre = domain.nombre;
    return entity;
  }
}
