import { Direccion } from '../../domain/entity/direccion.entity';
import { DireccionEntityORM } from '../persistence/direccion.orm-entity';

export class DireccionMapper {
  static toDomain(entity: DireccionEntityORM): Direccion {
    return new Direccion(
      entity.direccionId,
      entity.clienteId,
      entity.lineaDir,
      entity.barrio,
      entity.codigoPostal,
      entity.infoAdiccional,
    );
  }

  static toPersistence(domain: Direccion): DireccionEntityORM {
    const entity = new DireccionEntityORM();
    entity.direccionId = domain.direccionId;
    entity.clienteId = domain.clienteId;
    entity.lineaDir = domain.lineaDir;
    entity.barrio = domain.barrio;
    entity.codigoPostal = domain.codigoPostal;
    entity.infoAdiccional = domain.infoAdiccional;
    return entity;
  }
}
