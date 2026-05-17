import { Injectable, BadRequestException } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { AjusteInventarioEntityORM } from '../../../entities/ajuste-inventario.orm-entity'
import { ProductoEntityORM } from '../../../producto/infrastructure/persistence/producto.orm-entity'
import { UsuarioEntityORM } from '../../../usuario/infrastructure/persistence/usuario.orm-entity'
import type {
  PaginatedStockAdjustments,
  StockAdjustmentListItem,
  StockAdjustmentPageFilters,
} from '../../domain/inventory.types'

type RawAdjustmentRow = {
  adjustmentId: string | number
  productId: string | number
  productName: string
  productSku: string
  userId: string | number
  userUsername: string
  userFirstName: string | null
  userLastName: string | null
  cantidad: string | number
  stockAnterior: string | number
  stockNuevo: string | number
  tipoCambio: string
  motivo: string
  fecha: Date | string
}

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value
  if (!value) return 0
  return Number(value)
}

function buildUserDisplayName(firstName: string | null, lastName: string | null, username: string): string {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
  return fullName || username
}

@Injectable()
export class GetInventoryAdjustmentsUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async ejecutar(filters: StockAdjustmentPageFilters): Promise<PaginatedStockAdjustments> {
    const page = Math.max(filters.page || 1, 1)
    const limit = Math.min(Math.max(filters.limit || 15, 1), 15)

    const query = this.dataSource
      .getRepository(AjusteInventarioEntityORM)
      .createQueryBuilder('ajuste')
      .innerJoin(ProductoEntityORM, 'producto', 'producto.productoId = ajuste.productoId')
      .innerJoin(UsuarioEntityORM, 'usuario', 'usuario.usuarioId = ajuste.usuarioId')

    if (filters.productoId) {
      query.andWhere('ajuste.productoId = :productoId', { productoId: filters.productoId })
    }

    if (filters.usuarioId) {
      query.andWhere('ajuste.usuarioId = :usuarioId', { usuarioId: filters.usuarioId })
    }

    if (filters.tipoCambio) {
      query.andWhere('ajuste.tipoCambio = :tipoCambio', { tipoCambio: filters.tipoCambio })
    }

    if (filters.search?.trim()) {
      query.andWhere(
        '(producto.nombre ILIKE :search OR producto.sku ILIKE :search OR usuario.username ILIKE :search OR ajuste.motivo ILIKE :search)',
        { search: `%${filters.search.trim()}%` },
      )
    }

    // Fecha range filters
    if (filters.startDate) {
      const sd = new Date(filters.startDate)
      if (!isNaN(sd.getTime())) {
        // ensure start is at beginning of day (local)
        sd.setHours(0, 0, 0, 0)
        query.andWhere('ajuste.fecha >= :startDate', { startDate: sd.toISOString() })
      }
    }

    if (filters.endDate) {
      const ed = new Date(filters.endDate)
      if (!isNaN(ed.getTime())) {
        // include the entire day by setting time to end of day
        ed.setHours(23, 59, 59, 999)
        query.andWhere('ajuste.fecha <= :endDate', { endDate: ed.toISOString() })
      }
    }

    // Validate range if both provided
    if (filters.startDate && filters.endDate) {
      const sd = new Date(filters.startDate)
      const ed = new Date(filters.endDate)
      if (!isNaN(sd.getTime()) && !isNaN(ed.getTime())) {
        sd.setHours(0, 0, 0, 0)
        ed.setHours(23, 59, 59, 999)
        if (ed.getTime() < sd.getTime()) {
          throw new BadRequestException('endDate must be greater than or equal to startDate')
        }
      }
    }

    const total = await query.clone().getCount()

    const rows = await query
      .select('ajuste.ajusteInventarioId', 'adjustmentId')
      .addSelect('producto.productoId', 'productId')
      .addSelect('producto.nombre', 'productName')
      .addSelect('producto.sku', 'productSku')
      .addSelect('usuario.usuarioId', 'userId')
      .addSelect('usuario.username', 'userUsername')
      .addSelect('usuario.primer_nombre', 'userFirstName')
      .addSelect('usuario.primer_apellido', 'userLastName')
      .addSelect('ajuste.cantidad', 'cantidad')
      .addSelect('ajuste.stockAnterior', 'stockAnterior')
      .addSelect('ajuste.stockNuevo', 'stockNuevo')
      .addSelect('ajuste.tipoCambio', 'tipoCambio')
      .addSelect('ajuste.motivo', 'motivo')
      .addSelect('ajuste.fecha', 'fecha')
      // obtener rol del usuario (primer rol encontrado)
      .addSelect(
        `(SELECT r.nombre FROM usuario_rol ur JOIN rol r ON ur.rol_id = r.rol_id WHERE ur.usuario_id = usuario.usuario_id LIMIT 1)`,
        'userRole',
      )
      .orderBy('ajuste.fecha', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany<RawAdjustmentRow>()

    const data: StockAdjustmentListItem[] = rows.map((row) => ({
      ajusteInventarioId: toNumber(row.adjustmentId),
      productoId: toNumber(row.productId),
      usuarioId: toNumber(row.userId),
      cantidad: toNumber(row.cantidad),
      stockAnterior: toNumber(row.stockAnterior),
      stockNuevo: toNumber(row.stockNuevo),
      tipoCambio: row.tipoCambio as StockAdjustmentListItem['tipoCambio'],
      motivo: row.motivo,
      fecha: new Date(row.fecha),
      productoNombre: row.productName,
      productoSku: row.productSku,
      usuarioNombre: buildUserDisplayName(row.userFirstName, row.userLastName, row.userUsername),
      userRole: (row as any).userRole ?? null,
      userFirstName: row.userFirstName,
      userLastName: row.userLastName,
    }))

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    }
  }
}