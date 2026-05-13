import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { AjusteInventarioEntityORM, TipoCambioEnum } from '../../../entities/ajuste-inventario.orm-entity'
import type { RegisterStockAdjustmentData, StockAdjustment } from '../../domain/inventory.types'
import { TipoMovimientoEnum } from '../../../entities/kardex.orm-entity'
import type { IStockAdjustmentRepository } from '../../domain/stock-adjustment.repository'

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
    // Calcular tipo de cambio
    const diferencia = data.stockNuevo - data.stockAnterior
    const tipoCambio = diferencia > 0 ? TipoCambioEnum.AUMENTO : TipoCambioEnum.REDUCCION

    const entity = this.repository.create({
      productoId: data.productoId,
      usuarioId: data.usuarioId,
      tipoMovimiento: TipoMovimientoEnum.AJUSTE,
      cantidad: data.cantidad,
      stockAnterior: data.stockAnterior,
      stockNuevo: data.stockNuevo,
      tipoCambio,
      motivo: data.motivo,
    } as Partial<AjusteInventarioEntityORM>) as AjusteInventarioEntityORM

    const saved = await this.repository.save(entity as AjusteInventarioEntityORM)

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
