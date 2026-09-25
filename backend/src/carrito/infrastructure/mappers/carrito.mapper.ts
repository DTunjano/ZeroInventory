import { Carrito } from '../../domain/entity/carrito.entity';
import { CarritoEntityORM } from '../persistence/carrito.orm-entity';

export class CarritoMapper {
  static toDomain(entity: CarritoEntityORM): Carrito {
    return new Carrito(
      entity.carritoId,
      entity.usuarioId,
      entity.estado,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: Carrito): CarritoEntityORM {
    const entity = new CarritoEntityORM();
    entity.carritoId = domain.carritoId;
    entity.usuarioId = domain.usuarioId;
    entity.estado = domain.estado;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
