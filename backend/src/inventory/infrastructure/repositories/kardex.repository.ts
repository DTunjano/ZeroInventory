import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { KardexEntityORM, TipoMovimientoEnum } from '../../../kardex/infrastructure/persistence/kardex.orm-entity'
import { ProductoEntityORM } from '../../../producto/infrastructure/persistence/producto.orm-entity'
import { validateStock } from '../stock-transaction'
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
    } as Partial<KardexEntityORM>)
    const saved = await this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(ProductoEntityORM, {
        where: { productoId: data.productoId }, lock: { mode: 'pessimistic_write' },
      })
      if (!product) throw new NotFoundException('Producto no encontrado')
      if (![TipoMovimientoEnum.ENTRADA, TipoMovimientoEnum.SALIDA].includes(data.tipoMovimiento)) {
        throw new BadRequestException('Usa ENTRADA o SALIDA; los ajustes se registran en /inventory/adjustments')
      }
      product.cantidad += data.tipoMovimiento === TipoMovimientoEnum.ENTRADA ? data.cantidad : -data.cantidad
      validateStock(product.cantidad)
      product.updatedAt = new Date()
      await manager.save(ProductoEntityORM, product)
      return manager.save(KardexEntityORM, entity)
    })
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
    }
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
    }))
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
