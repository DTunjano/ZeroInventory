import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { ClienteEntityORM } from '../../../cliente/infrastructure/persistence/cliente.orm-entity'
import { KardexEntityORM, TipoMovimientoEnum, TipoReferenciaEnum } from '../../../entities/kardex.orm-entity'
import { PagoEntityORM } from '../../../pago/infrastructure/persistence/pago.orm-entity'
import { EstadoPedidoEnum } from '../../../pedido/domain/entity/pedido.entity'
import { PedidoEntityORM } from '../../../pedido/infrastructure/persistence/pedido.orm-entity'
import { ProductoEntityORM } from '../../../producto/infrastructure/persistence/producto.orm-entity'
import { UsuarioEntityORM } from '../../../usuario/infrastructure/persistence/usuario.orm-entity'
import { EstadoPagoEnum } from '../../../pago/domain/entity/pago.entity'
import type {
  AdminDashboardResponse,
  InventoryMovementPoint,
  MonthlySeriesPoint,
  RecentActivityPoint,
  RecentOrderPoint,
  TopProductPoint,
} from '../../domain/admin-dashboard.types'

type RawValueRow = { period: string; value: string | number }
type RawInventoryRow = { period: string; entradas: string | number; salidas: string | number }
type RawTopProductRow = {
  productId: string | number
  name: string
  soldQuantity: string | number
  revenue: string | number
}
type RawOrderRow = {
  orderId: string | number
  customerName: string | null
  username: string
  firstName: string | null
  lastName: string | null
  total: string | number
  state: string
  paymentStatus: string
  date: Date | string
}
type RawActivityRow = {
  movementId: string | number
  productName: string
  typeMovement: string
  quantity: string | number
  referenceId: string | number
  date: Date | string
}

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value
  if (!value) return 0
  return Number(value)
}

function getLastPeriods(count = 6): string[] {
  const periods: string[] = []
  const current = new Date()

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(current.getFullYear(), current.getMonth() - index, 1)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    periods.push(`${date.getFullYear()}-${month}`)
  }

  return periods
}

function fillMonthlySeries(rows: RawValueRow[], periods: string[]): MonthlySeriesPoint[] {
  const map = new Map(rows.map((row) => [row.period, toNumber(row.value)]))
  return periods.map((period) => ({ period, value: map.get(period) ?? 0 }))
}

function fillInventorySeries(rows: RawInventoryRow[], periods: string[]): InventoryMovementPoint[] {
  const map = new Map(rows.map((row) => [row.period, row]))
  return periods.map((period) => ({
    period,
    entradas: toNumber(map.get(period)?.entradas),
    salidas: toNumber(map.get(period)?.salidas),
  }))
}

function formatCustomerName(firstName: string | null, lastName: string | null, username: string): string {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
  return fullName || username
}

@Injectable()
export class GetAdminDashboardUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async ejecutar(): Promise<AdminDashboardResponse> {
    const periods = getLastPeriods(6)

    const [
      totalPedidos,
      totalProductos,
      totalUsuarios,
      totalMovimientosInventario,
      totalProductosVendidos,
      totalIngresos,
      pedidosCompletados,
      productosBajoStock,
      revenueRows,
      orderRows,
      inventoryRows,
      topProductsRows,
      recentOrdersRows,
      recentActivityRows,
    ] = await Promise.all([
      this.dataSource.getRepository(PedidoEntityORM).count(),
      this.dataSource.getRepository(ProductoEntityORM).count(),
      this.dataSource.getRepository(UsuarioEntityORM).count(),
      this.dataSource.getRepository(KardexEntityORM).count(),
      this.dataSource
        .getRepository(KardexEntityORM)
        .createQueryBuilder('kardex')
        .select('COALESCE(SUM(kardex.cantidad), 0)', 'value')
        .where('kardex.tipoMovimiento = :tipoMovimiento', {
          tipoMovimiento: TipoMovimientoEnum.SALIDA,
        })
        .andWhere('kardex.tipoReferencia = :tipoReferencia', {
          tipoReferencia: TipoReferenciaEnum.VENTA,
        })
        .getRawOne<{ value: string | number }>(),
      this.dataSource
        .getRepository(PagoEntityORM)
        .createQueryBuilder('pago')
        .select('COALESCE(SUM(pago.monto), 0)', 'value')
        .where('pago.estado = :estado', { estado: EstadoPagoEnum.APROBADO })
        .getRawOne<{ value: string | number }>(),
      this.dataSource
        .getRepository(PedidoEntityORM)
        .createQueryBuilder('pedido')
        .where('pedido.estado = :estado', { estado: EstadoPedidoEnum.COMPLETADO })
        .getCount(),
      this.dataSource
        .getRepository(ProductoEntityORM)
        .createQueryBuilder('producto')
        .where('producto.cantidad <= :threshold', { threshold: 20 })
        .getCount(),
      this.dataSource
        .getRepository(PagoEntityORM)
        .createQueryBuilder('pago')
        .select("TO_CHAR(DATE_TRUNC('month', pago.fechaPago), 'YYYY-MM')", 'period')
        .addSelect('SUM(pago.monto)', 'value')
        .where('pago.estado = :estado', { estado: EstadoPagoEnum.APROBADO })
        .andWhere(`pago.fechaPago >= (CURRENT_DATE - INTERVAL '5 months')`)
        .groupBy("DATE_TRUNC('month', pago.fechaPago)")
        .orderBy("DATE_TRUNC('month', pago.fechaPago)", 'ASC')
        .getRawMany<RawValueRow>(),
      this.dataSource
        .getRepository(PedidoEntityORM)
        .createQueryBuilder('pedido')
        .where(`pedido.fecha >= (CURRENT_DATE - INTERVAL '5 months')`)
        .select("TO_CHAR(DATE_TRUNC('month', pedido.fecha), 'YYYY-MM')", 'period')
        .addSelect('COUNT(*)', 'value')
        .groupBy("DATE_TRUNC('month', pedido.fecha)")
        .orderBy("DATE_TRUNC('month', pedido.fecha)", 'ASC')
        .getRawMany<RawValueRow>(),
      this.dataSource
        .getRepository(KardexEntityORM)
        .createQueryBuilder('kardex')
        .select("TO_CHAR(DATE_TRUNC('month', kardex.fechaMovimiento), 'YYYY-MM')", 'period')
        .addSelect(
          "COALESCE(SUM(CASE WHEN kardex.tipoMovimiento = 'ENTRADA' THEN kardex.cantidad ELSE 0 END), 0)",
          'entradas',
        )
        .addSelect(
          "COALESCE(SUM(CASE WHEN kardex.tipoMovimiento = 'SALIDA' THEN kardex.cantidad ELSE 0 END), 0)",
          'salidas',
        )
        .where(`kardex.fechaMovimiento >= (CURRENT_DATE - INTERVAL '5 months')`)
        .groupBy("DATE_TRUNC('month', kardex.fechaMovimiento)")
        .orderBy("DATE_TRUNC('month', kardex.fechaMovimiento)", 'ASC')
        .getRawMany<RawInventoryRow>(),
      this.dataSource
        .getRepository(KardexEntityORM)
        .createQueryBuilder('kardex')
        .innerJoin(ProductoEntityORM, 'producto', 'producto.productoId = kardex.productoId')
        .select('producto.productoId', 'productId')
        .addSelect('producto.nombre', 'name')
        .addSelect('COALESCE(SUM(kardex.cantidad), 0)', 'soldQuantity')
        .addSelect('COALESCE(SUM(kardex.valorTotal), 0)', 'revenue')
        .where('kardex.tipoMovimiento = :tipoMovimiento', {
          tipoMovimiento: TipoMovimientoEnum.SALIDA,
        })
        .andWhere('kardex.tipoReferencia = :tipoReferencia', {
          tipoReferencia: TipoReferenciaEnum.VENTA,
        })
        .groupBy('producto.productoId')
        .addGroupBy('producto.nombre')
        .orderBy('COALESCE(SUM(kardex.cantidad), 0)', 'DESC')
        .limit(5)
        .getRawMany<RawTopProductRow>(),
      this.dataSource
        .getRepository(PedidoEntityORM)
        .createQueryBuilder('pedido')
        .innerJoin(PagoEntityORM, 'pago', 'pago.pedidoId = pedido.pedidoId')
        .innerJoin(ClienteEntityORM, 'cliente', 'cliente.clienteId = pedido.clienteId')
        .innerJoin(UsuarioEntityORM, 'usuario', 'usuario.usuarioId = cliente.usuarioId')
        .select('pedido.pedido_id', 'orderId')
        .addSelect('pedido.total', 'total')
        .addSelect('pedido.estado', 'state')
        .addSelect('pedido.fecha', 'date')
        .addSelect('pago.estado', 'paymentStatus')
        .addSelect('usuario.username', 'username')
        .addSelect('usuario.primer_nombre', 'firstName')
        .addSelect('usuario.primer_apellido', 'lastName')
        .where('pago.estado = :estado', { estado: EstadoPagoEnum.APROBADO })
        .orderBy('pedido.fecha', 'DESC')
        .limit(5)
        .getRawMany<RawOrderRow>(),
      this.dataSource
        .getRepository(KardexEntityORM)
        .createQueryBuilder('kardex')
        .innerJoin(ProductoEntityORM, 'producto', 'producto.productoId = kardex.productoId')
        .select('kardex.kardexId', 'movementId')
        .addSelect('producto.nombre', 'productName')
        .addSelect('kardex.tipoMovimiento', 'typeMovement')
        .addSelect('kardex.cantidad', 'quantity')
        .addSelect('kardex.referenciaId', 'referenceId')
        .addSelect('kardex.fechaMovimiento', 'date')
        .orderBy('kardex.fechaMovimiento', 'DESC')
        .limit(8)
        .getRawMany<RawActivityRow>(),
    ])

    const summary = {
      totalPedidos,
      totalIngresos: toNumber(totalIngresos?.value),
      totalProductos,
      totalUsuarios,
      totalMovimientosInventario,
      totalProductosVendidos: toNumber(totalProductosVendidos?.value),
      pedidosCompletados,
      productosBajoStock,
    }

    const revenueOverview = fillMonthlySeries(revenueRows, periods)
    const orderVolume = fillMonthlySeries(orderRows, periods)
    const inventoryMovements = fillInventorySeries(inventoryRows, periods)
    const topProducts: TopProductPoint[] = topProductsRows.map((row) => ({
      productId: toNumber(row.productId),
      name: row.name,
      soldQuantity: toNumber(row.soldQuantity),
      revenue: toNumber(row.revenue),
    }))
    const recentOrders: RecentOrderPoint[] = recentOrdersRows.map((row) => ({
      orderId: toNumber(row.orderId),
      customerName: formatCustomerName(
        row.firstName,
        row.lastName,
        row.username,
      ),
      username: row.username,
      total: toNumber(row.total),
      state: row.state,
      paymentStatus: row.paymentStatus,
      date: new Date(row.date).toISOString(),
    }))
    const recentActivity: RecentActivityPoint[] = recentActivityRows.map((row) => ({
      movementId: toNumber(row.movementId),
      productName: row.productName,
      typeMovement: row.typeMovement,
      quantity: toNumber(row.quantity),
      referenceId: toNumber(row.referenceId),
      date: new Date(row.date).toISOString(),
    }))

    return {
      summary,
      revenueOverview,
      orderVolume,
      inventoryMovements,
      topProducts,
      recentOrders,
      recentActivity,
    }
  }
}