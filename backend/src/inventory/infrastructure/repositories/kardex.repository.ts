import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { KardexEntityORM } from '../../../entities/kardex.orm-entity'
import type { CreateKardexMovementData, KardexMovement } from '../../domain/inventory.types'
import type { IKardexRepository } from '../../domain/kardex.repository'

/**
 * Implementación del repositorio de Kardex
 * Persiste y consulta movimientos de inventario
 */
@Injectable()
export class KardexRepository implements IKardexRepository {
  private repository: Repository<KardexEntityORM>

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(KardexEntityORM)
  }

  async createMovement(data: CreateKardexMovementData): Promise<KardexMovement> {
    const entity = this.repository.create({
      productoId: data.productoId,
      tipoMovimiento: data.tipoMovimiento,
      cantidad: data.cantidad,
      costoUnitario: data.costoUnitario,
      valorTotal: data.valorTotal,
      referenciaId: data.referenciaId,
      tipoReferencia: data.tipoReferencia,
    } as Partial<KardexEntityORM>) as KardexEntityORM
    const saved = await this.repository.save(entity as KardexEntityORM)
    return {
      kardexId: saved.kardexId,
      productoId: saved.productoId,
      tipoMovimiento: saved.tipoMovimiento,
      cantidad: saved.cantidad,
      costoUnitario: Number(saved.costoUnitario),
      valorTotal: Number(saved.valorTotal),
      referenciaId: saved.referenciaId,
      tipoReferencia: saved.tipoReferencia,
      fechaMovimiento: saved.fechaMovimiento,
    } as KardexMovement
  }

  async getMovementsByProduct(productoId: number, limit = 10): Promise<KardexMovement[]> {
    const entities = await this.repository
      .createQueryBuilder('kardex')
      .where('kardex.productoId = :productoId', { productoId })
      .orderBy('kardex.fechaMovimiento', 'DESC')
      .limit(limit)
      .getMany()
    
    return entities.map((e) => ({
      kardexId: e.kardexId,
      productoId: e.productoId,
      tipoMovimiento: e.tipoMovimiento,
      cantidad: e.cantidad,
      costoUnitario: Number(e.costoUnitario),
      valorTotal: Number(e.valorTotal),
      referenciaId: e.referenciaId,
      tipoReferencia: e.tipoReferencia,
      fechaMovimiento: e.fechaMovimiento,
    } as KardexMovement))
  }

  async getProductStockBalance(productoId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('kardex')
      .select(
        `COALESCE(SUM(CASE WHEN kardex.tipoMovimiento = 'ENTRADA' THEN kardex.cantidad ELSE -kardex.cantidad END), 0)`,
        'balance',
      )
      .where('kardex.productoId = :productoId', { productoId })
      .andWhere("kardex.tipoMovimiento IN ('ENTRADA', 'SALIDA')")
      .getRawOne<{ balance: string | number }>()
    
    return Number(result?.balance ?? 0)
  }
}
