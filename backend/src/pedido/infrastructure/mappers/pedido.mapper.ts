import { Pedido, EstadoPedidoEnum } from '../../domain/entity/pedido.entity';
import { PedidoEntityORM } from '../persistence/pedido.orm-entity';

export class PedidoMapper {
  static toDomain(entity: PedidoEntityORM): Pedido {
    return new Pedido(
      entity.pedidoId,
      entity.clienteId,
      entity.direccionId,
      entity.estado,
      entity.total,
      entity.fecha,
    );
  }

  static toPersistence(domain: Pedido): PedidoEntityORM {
    const entity = new PedidoEntityORM();
    entity.pedidoId = domain.pedidoId;
    entity.clienteId = domain.clienteId;
    entity.direccionId = domain.direccionId;
    entity.estado = domain.estado;
    entity.total = domain.total;
    entity.fecha = domain.fecha;
    return entity;
  }
}
