import { BadRequestException, ConflictException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ProductoEntityORM } from '../../producto/infrastructure/persistence/producto.orm-entity';
import { AjusteInventarioEntityORM, TipoCambioEnum } from '../../ajuste-inventario/infrastructure/persistence/ajuste-inventario.orm-entity';
import { KardexEntityORM, TipoMovimientoEnum, TipoReferenciaEnum } from '../../kardex/infrastructure/persistence/kardex.orm-entity';

export function validateStock(stock: number) {
  if (!Number.isInteger(stock) || stock < 0 || stock > 2147483647) {
    throw new BadRequestException('El stock debe ser un entero no negativo válido');
  }
}

// The caller owns the transaction and has locked the product FOR UPDATE.
export async function recordStockAdjustment(
  manager: EntityManager, product: ProductoEntityORM, userId: number,
  newStock: number, expectedStock: number, reason: string,
): Promise<AjusteInventarioEntityORM> {
  validateStock(newStock);
  if (product.cantidad !== expectedStock) {
    throw new ConflictException('El stock cambió. Actualiza el producto antes de ajustar.');
  }
  const difference = newStock - product.cantidad;
  if (!difference || !reason.trim()) throw new BadRequestException('El ajuste requiere un cambio de stock y un motivo');
  const adjustment = await manager.save(AjusteInventarioEntityORM, manager.create(AjusteInventarioEntityORM, {
    productoId: product.productoId, usuarioId: userId, cantidad: Math.abs(difference),
    stockAnterior: product.cantidad, stockNuevo: newStock,
    tipoMovimiento: TipoMovimientoEnum.AJUSTE,
    tipoCambio: difference > 0 ? TipoCambioEnum.AUMENTO : TipoCambioEnum.REDUCCION,
    motivo: reason.trim(),
  }));
  await manager.insert(KardexEntityORM, {
    productoId: product.productoId,
    tipoMovimiento: difference > 0 ? TipoMovimientoEnum.ENTRADA : TipoMovimientoEnum.SALIDA,
    cantidad: Math.abs(difference), costoUnitario: Number(product.precio),
    valorTotal: Math.abs(difference) * Number(product.precio),
    referenciaId: adjustment.ajusteInventarioId, tipoReferencia: TipoReferenciaEnum.AJUSTE,
  });
  product.cantidad = newStock;
  product.updatedAt = new Date();
  await manager.save(ProductoEntityORM, product);
  return adjustment;
}
