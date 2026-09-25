import { Usuario } from '../../domain/entity/usuario.entity';
import { UsuarioEntityORM } from '../persistence/usuario.orm-entity';

export class UsuarioMapper {
  static toDomain(entity: UsuarioEntityORM): Usuario {
    return new Usuario(
      entity.usuarioId,
      entity.username,
      entity.password,
      entity.primerNombre,
      entity.segundoNombre,
      entity.primerApellido,
      entity.segundoApellido,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: Usuario): UsuarioEntityORM {
    const entity = new UsuarioEntityORM();
    entity.usuarioId = domain.usuarioId;
    entity.username = domain.username;
    entity.password = domain.password;
    entity.primerNombre = domain.primerNombre;
    entity.segundoNombre = domain.segundoNombre;
    entity.primerApellido = domain.primerApellido;
    entity.segundoApellido = domain.segundoApellido;
    entity.isActive = domain.isActive;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
