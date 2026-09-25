import { CarritoDetalle } from '../../domain/entity/carrito-detalle.entity';
import { CarritoDetalleEntityORM } from '../persistence/carrito-detalle.orm-entity';

export class CarritoDetalleMapper {
  static toDomain(entity: CarritoDetalleEntityORM): CarritoDetalle {
    return new CarritoDetalle(
      entity.carritoDetalleId,
      entity.carritoId,
      entity.productoId,
      entity.cantidad,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: CarritoDetalle): CarritoDetalleEntityORM {
    const entity = new CarritoDetalleEntityORM();
    entity.carritoDetalleId = domain.carritoDetalleId;
    entity.carritoId = domain.carritoId;
    entity.productoId = domain.productoId;
    entity.cantidad = domain.cantidad;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
