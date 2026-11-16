import { Injectable, BadRequestException } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { AjusteInventarioEntityORM } from '../../../ajuste-inventario/infrastructure/persistence/ajuste-inventario.orm-entity'
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
  registradoEn?: Date | string | null
  userRole?: string | null
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

    // Calendar filters match the display zone for new instants; old naive dates
    // retain their existing calendar values without inventing a historical zone.
    const calendarDate = (value: string) => {
      if (!/^[1-9]\d{3}-\d{2}-\d{2}(?:$|T)/.test(value)) throw new BadRequestException('Fecha ISO inválida');
      const prefix = value.slice(0, 10)
      const midnight = new Date(`${prefix}T00:00:00Z`)
      if (!Number.isFinite(midnight.getTime()) || midnight.toISOString().slice(0, 10) !== prefix) throw new BadRequestException('Fecha inválida')
      if (value.length === 10) return value
      const instant = new Date(value)
      if (!Number.isFinite(instant.getTime())) throw new BadRequestException('Fecha inválida')
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant)
    }
    const startDate = filters.startDate ? calendarDate(filters.startDate) : undefined
    const endDate = filters.endDate ? calendarDate(filters.endDate) : undefined
    if (startDate && endDate && endDate < startDate) throw new BadRequestException('La fecha final debe ser posterior o igual a la inicial')
    const dateExpression = "COALESCE(ajuste.registradoEn AT TIME ZONE 'America/Bogota', ajuste.fecha)"
    if (startDate) query.andWhere(`${dateExpression} >= :startDate::date`, { startDate })
    if (endDate) query.andWhere(`${dateExpression} < :endDate::date + INTERVAL '1 day'`, { endDate })

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
      .addSelect('ajuste.registradoEn', 'registradoEn')
      // obtener rol del usuario (primer rol encontrado)
      .addSelect(
        `(SELECT r.nombre FROM usuario_rol ur JOIN rol r ON ur.rol_id = r.rol_id WHERE ur.usuario_id = usuario.usuario_id LIMIT 1)`,
        'userRole',
      )
      .orderBy(dateExpression, 'DESC')
      .addOrderBy('ajuste.ajusteInventarioId', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
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
      fecha: new Date(row.registradoEn ?? row.fecha),
      productoNombre: row.productName,
      productoSku: row.productSku,
      usuarioNombre: buildUserDisplayName(row.userFirstName, row.userLastName, row.userUsername),
      userRole: row.userRole ?? null,
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
