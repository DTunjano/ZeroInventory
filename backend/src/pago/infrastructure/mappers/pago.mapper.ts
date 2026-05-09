import { Pago } from '../../domain/entity/pago.entity';
import { PagoEntityORM } from '../persistence/pago.orm-entity';

export class PagoMapper {
  static toDomain(entity: PagoEntityORM): Pago {
    return new Pago(
      entity.pagoId,
      entity.pedidoId,
      entity.metodoPago,
      entity.monto,
      entity.estado,
      entity.fechaPago,
    );
  }

  static toPersistence(domain: Pago): PagoEntityORM {
    const entity = new PagoEntityORM();
    entity.pagoId = domain.pagoId;
    entity.pedidoId = domain.pedidoId;
    entity.metodoPago = domain.metodoPago;
    entity.monto = domain.monto;
    entity.estado = domain.estado;
    entity.fechaPago = domain.fechaPago;
    return entity;
  }
}
