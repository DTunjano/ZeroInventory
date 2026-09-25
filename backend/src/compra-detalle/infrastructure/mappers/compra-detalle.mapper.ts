import { CompraDetalle } from '../../domain/entity/compra-detalle.entity';
import { CompraDetalleEntityORM } from '../persistence/compra-detalle.orm-entity';

export class CompraDetalleMapper {
  static toDomain(entity: CompraDetalleEntityORM): CompraDetalle {
    return new CompraDetalle(
      entity.compraDetalleId,
      entity.compraId,
      entity.productoId,
      entity.cantidad,
      Number(entity.costoUnitario),
      Number(entity.subtotal),
    );
  }

  static toPersistence(domain: CompraDetalle): CompraDetalleEntityORM {
    const entity = new CompraDetalleEntityORM();
    entity.compraDetalleId = domain.compraDetalleId;
    entity.compraId = domain.compraId;
    entity.productoId = domain.productoId;
    entity.cantidad = domain.cantidad;
    entity.costoUnitario = domain.costoUnitario;
    entity.subtotal = domain.subtotal;
    return entity;
  }
}
