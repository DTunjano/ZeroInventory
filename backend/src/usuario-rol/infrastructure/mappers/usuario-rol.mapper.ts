import { UsuarioRol } from '../../domain/entity/usuario-rol.entity';
import { UsuarioRolEntityORM } from '../persistence/usuario-rol.orm-entity';

export class UsuarioRolMapper {
  static toDomain(entity: UsuarioRolEntityORM): UsuarioRol {
    return new UsuarioRol(entity.usuarioRolId, entity.usuarioId, entity.rolId);
  }

  static toPersistence(domain: UsuarioRol): UsuarioRolEntityORM {
    const entity = new UsuarioRolEntityORM();
    entity.usuarioRolId = domain.usuarioRolId;
    entity.usuarioId = domain.usuarioId;
    entity.rolId = domain.rolId;
    return entity;
  }
}
