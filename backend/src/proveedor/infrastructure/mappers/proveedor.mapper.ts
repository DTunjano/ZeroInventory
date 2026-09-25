import { Proveedor } from '../../domain/entity/proveedor.entity';
import { ProveedorEntityORM } from '../persistence/proveedor.orm-entity';

export class ProveedorMapper {
  static toDomain(entity: ProveedorEntityORM): Proveedor {
    return new Proveedor(
      entity.proveedorId,
      entity.nombre,
      entity.telefono,
      entity.email,
    );
  }

  static toPersistence(domain: Proveedor): ProveedorEntityORM {
    const entity = new ProveedorEntityORM();
    entity.proveedorId = domain.proveedorId;
    entity.nombre = domain.nombre;
    entity.telefono = domain.telefono;
    entity.email = domain.email;
    return entity;
  }
}
