import { Compra } from '../../domain/entity/compra.entity';
import { CompraEntityORM } from '../persistence/compra.orm-entity';

export class CompraMapper {
  static toDomain(entity: CompraEntityORM): Compra {
    return new Compra(
      entity.compraId,
      entity.proveedorId,
      entity.usuarioId,
      Number(entity.total),
      entity.fechaCompra,
    );
  }

  static toPersistence(domain: Compra): CompraEntityORM {
    const entity = new CompraEntityORM();
    entity.compraId = domain.compraId;
    entity.proveedorId = domain.proveedorId;
    entity.usuarioId = domain.usuarioId;
    entity.total = domain.total;
    entity.fechaCompra = domain.fechaCompra;
    return entity;
  }
}
