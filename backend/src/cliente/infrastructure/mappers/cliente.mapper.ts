import { Cliente, TipoDocumentoEnum } from '../../domain/entity/cliente.entity';
import { ClienteEntityORM, TipoDocumentoEnumORM } from '../persistence/cliente.orm-entity';

export class ClienteMapper {
  static toDomain(entity: ClienteEntityORM): Cliente {
    return new Cliente(
      entity.clienteId,
      entity.usuarioId,
      entity.tipoDocumento as unknown as TipoDocumentoEnum,
      entity.documento,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: Cliente): ClienteEntityORM {
    const entity = new ClienteEntityORM();
    entity.clienteId = domain.clienteId;
    entity.usuarioId = domain.usuarioId;
    entity.tipoDocumento = domain.tipoDocumento as unknown as TipoDocumentoEnumORM;
    entity.documento = domain.documento;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
