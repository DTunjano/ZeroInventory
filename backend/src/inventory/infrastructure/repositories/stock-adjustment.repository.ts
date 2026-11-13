import { Injectable, NotFoundException } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { AjusteInventarioEntityORM } from '../../../ajuste-inventario/infrastructure/persistence/ajuste-inventario.orm-entity'
import type { RegisterStockAdjustmentData, StockAdjustment } from '../../domain/inventory.types'
import type { IStockAdjustmentRepository } from '../../domain/stock-adjustment.repository'
import { ProductoEntityORM } from '../../../producto/infrastructure/persistence/producto.orm-entity'
import { recordStockAdjustment } from '../stock-transaction'

/**
 * Implementación del repositorio de ajustes de inventario
 * Auditoría completa de cambios de stock con trazabilidad
 */
@Injectable()
export class StockAdjustmentRepository implements IStockAdjustmentRepository {
  private repository: Repository<AjusteInventarioEntityORM>

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(AjusteInventarioEntityORM)
  }

  async registerAdjustment(data: RegisterStockAdjustmentData): Promise<StockAdjustment> {
    const saved = await this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(ProductoEntityORM, {
        where: { productoId: data.productoId }, lock: { mode: 'pessimistic_write' },
      })
      if (!product) throw new NotFoundException('Producto no encontrado')
      return recordStockAdjustment(manager, product, data.usuarioId, data.stockNuevo, data.stockAnterior, data.motivo)
    })

    return {
      ajusteInventarioId: saved.ajusteInventarioId,
      productoId: saved.productoId,
      usuarioId: saved.usuarioId,
      cantidad: saved.cantidad,
      stockAnterior: saved.stockAnterior,
      stockNuevo: saved.stockNuevo,
      tipoCambio: saved.tipoCambio,
      motivo: saved.motivo,
      fecha: saved.fecha,
    } as StockAdjustment
  }

  async getAdjustmentsByProduct(productoId: number, limit = 10): Promise<StockAdjustment[]> {
    const entities = await this.repository
      .createQueryBuilder('ajuste')
      .where('ajuste.productoId = :productoId', { productoId })
      .orderBy('ajuste.fecha', 'DESC')
      .limit(limit)
      .getMany()

    return entities.map((e) => ({
      ajusteInventarioId: e.ajusteInventarioId,
      productoId: e.productoId,
      usuarioId: e.usuarioId,
      cantidad: e.cantidad,
      stockAnterior: e.stockAnterior,
      stockNuevo: e.stockNuevo,
      tipoCambio: e.tipoCambio,
      motivo: e.motivo,
      fecha: e.fecha,
    } as StockAdjustment))
  }

  async getAdjustmentsByUser(usuarioId: number, limit = 10): Promise<StockAdjustment[]> {
    const entities = await this.repository
      .createQueryBuilder('ajuste')
      .where('ajuste.usuarioId = :usuarioId', { usuarioId })
      .orderBy('ajuste.fecha', 'DESC')
      .limit(limit)
      .getMany()

    return entities.map((e) => ({
      ajusteInventarioId: e.ajusteInventarioId,
      productoId: e.productoId,
      usuarioId: e.usuarioId,
      cantidad: e.cantidad,
      stockAnterior: e.stockAnterior,
      stockNuevo: e.stockNuevo,
      tipoCambio: e.tipoCambio,
      motivo: e.motivo,
      fecha: e.fecha,
    } as StockAdjustment))
  }
}
