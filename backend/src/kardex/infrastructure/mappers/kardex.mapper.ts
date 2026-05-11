import { Kardex } from '../../domain/entity/kardex.entity';
import { KardexEntityORM } from '../persistence/kardex.orm-entity';

export class KardexMapper {
  static toDomain(kardexORM: KardexEntityORM): Kardex {
    return new Kardex(
      kardexORM.kardexId,
      kardexORM.productoId,
      kardexORM.tipoMovimiento,
      kardexORM.cantidad,
      Number(kardexORM.costoUnitario),
      Number(kardexORM.valorTotal),
      kardexORM.referenciaId,
      kardexORM.tipoReferencia,
      kardexORM.fechaMovimiento,
    );
  }

  static toPersistence(kardex: Kardex): KardexEntityORM {
    const kardexORM = new KardexEntityORM();
    kardexORM.kardexId = kardex.kardexId;
    kardexORM.productoId = kardex.productoId;
    kardexORM.tipoMovimiento = kardex.tipoMovimiento;
    kardexORM.cantidad = kardex.cantidad;
    kardexORM.costoUnitario = kardex.costoUnitario;
    kardexORM.valorTotal = kardex.valorTotal;
    kardexORM.referenciaId = kardex.referenciaId;
    kardexORM.tipoReferencia = kardex.tipoReferencia;
    kardexORM.fechaMovimiento = kardex.fechaMovimiento;
    return kardexORM;
  }
}
