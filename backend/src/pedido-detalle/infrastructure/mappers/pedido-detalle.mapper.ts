import { PedidoDetalle } from '../../domain/entity/pedido-detalle.entity';
import { PedidoDetalleEntityORM } from '../persistence/pedido-detalle.orm-entity';

export class PedidoDetalleMapper {
  static toDomain(entity: PedidoDetalleEntityORM): PedidoDetalle {
    return new PedidoDetalle(
      entity.pedidoDetalleId,
      entity.pedidoId,
      entity.productoId,
      entity.cantidad,
      entity.precioUnitario,
      entity.subtotal,
    );
  }

  static toPersistence(domain: PedidoDetalle): PedidoDetalleEntityORM {
    const entity = new PedidoDetalleEntityORM();
    entity.pedidoDetalleId = domain.pedidoDetalleId;
    entity.pedidoId = domain.pedidoId;
    entity.productoId = domain.productoId;
    entity.cantidad = domain.cantidad;
    entity.precioUnitario = domain.precioUnitario;
    entity.subtotal = domain.subtotal;
    return entity;
  }
}
