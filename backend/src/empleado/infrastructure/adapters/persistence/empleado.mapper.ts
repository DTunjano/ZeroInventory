import { Empleado, EmpleadoEstadoEnum } from '../../../domain/entity/empleado.entity';
import { EmpleadoEntityORM } from './empleado.orm-entity';

export class EmpleadoMapper {
  static toDomain(entity: EmpleadoEntityORM): Empleado {
    return new Empleado(
      entity.empleadoId,
      entity.nombre,
      entity.email,
      entity.estado as EmpleadoEstadoEnum,
      entity.usuarioId,
      entity.telefono,
      entity.documento,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(empleado: Empleado): EmpleadoEntityORM {
    const entity = new EmpleadoEntityORM();
    if (empleado.empleadoId !== null) {
      if (empleado.empleadoId > 0) entity.empleadoId = empleado.empleadoId;
    }
    entity.nombre = empleado.nombre;
    entity.email = empleado.email;
    entity.estado = empleado.estado;
    entity.usuarioId = empleado.usuarioId;
    entity.telefono = empleado.telefono;
    entity.documento = empleado.documento;
    entity.createdAt = empleado.createdAt;
    entity.updatedAt = empleado.updatedAt;
    return entity;
  }
}
