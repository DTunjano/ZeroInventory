import { AjusteInventario } from '../../domain/entity/ajuste-inventario.entity';
import { AjusteInventarioEntityORM } from '../persistence/ajuste-inventario.orm-entity';

export class AjusteInventarioMapper {
  static toDomain(entity: AjusteInventarioEntityORM): AjusteInventario {
    return new AjusteInventario(
      entity.ajusteInventarioId,
      entity.productoId,
      entity.usuarioId,
      entity.cantidad,
      entity.motivo,
      entity.fecha,
    );
  }

  static toPersistence(domain: AjusteInventario): AjusteInventarioEntityORM {
    const entity = new AjusteInventarioEntityORM();
    entity.ajusteInventarioId = domain.ajusteInventarioId;
    entity.productoId = domain.productoId;
    entity.usuarioId = domain.usuarioId;
    entity.cantidad = domain.cantidad;
    entity.motivo = domain.motivo;
    entity.fecha = domain.fecha;
    return entity;
  }
}
