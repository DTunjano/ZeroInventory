import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { ClienteEntityORM } from '../../../cliente/infrastructure/persistence/cliente.orm-entity'
import { KardexEntityORM } from '../../../kardex/infrastructure/persistence/kardex.orm-entity'
import { PedidoDetalleEntityORM } from '../../../pedido-detalle/infrastructure/persistence/pedido-detalle.orm-entity'
import { PagoEntityORM } from '../../../pago/infrastructure/persistence/pago.orm-entity'
import { EstadoPedidoEnum } from '../../../pedido/domain/entity/pedido.entity'
import { PedidoEntityORM } from '../../../pedido/infrastructure/persistence/pedido.orm-entity'
import { ProductoEntityORM } from '../../../producto/infrastructure/persistence/producto.orm-entity'
import { UsuarioEntityORM } from '../../../usuario/infrastructure/persistence/usuario.orm-entity'
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
  itemsCount: string | number
  state: string
  paymentStatus: string
  paymentMethod: string
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

function getCompletedOrderConditions() {
  return {
    paymentState: 'APROBADO' as const,
    orderStates: [EstadoPedidoEnum.CONFIRMADO, EstadoPedidoEnum.COMPLETADO, EstadoPedidoEnum.ENVIADO],
  }
}

@Injectable()
export class GetAdminDashboardUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async ejecutar(): Promise<AdminDashboardResponse> {
    const periods = getLastPeriods(12)
    const completedOrderConditions = getCompletedOrderConditions()

    const [
      totalPedidos,
      totalProductos,
      totalUsuarios,
      totalMovimientosInventario,
      totalIngresos,
      pedidosCompletados,
      productosBajoStock,
      revenueRows,
      orderRows,
      inventoryRows,
      totalProductosVendidos,
      topProductsRows,
      recentOrdersRows,
      recentActivityRows,
    ] = await Promise.all([
      this.dataSource.getRepository(PedidoEntityORM).count(),
      this.dataSource.getRepository(ProductoEntityORM).count(),
      this.dataSource.getRepository(UsuarioEntityORM).count(),
      this.dataSource.getRepository(KardexEntityORM).count(),
      this.dataSource
        .getRepository(PedidoEntityORM)
        .createQueryBuilder('pedido')
        .innerJoin(PagoEntityORM, 'pago', 'pago.pedidoId = pedido.pedidoId')
        .select('COALESCE(SUM(pedido.total), 0)', 'value')
        .andWhere('pago.estado = :paymentState', { paymentState: completedOrderConditions.paymentState })
        .getRawOne<{ value: string | number }>(),
      this.dataSource
        .getRepository(PedidoEntityORM)
        .createQueryBuilder('pedido')
        .innerJoin(PagoEntityORM, 'pago', 'pago.pedidoId = pedido.pedidoId')
        .andWhere('pago.estado = :paymentState', { paymentState: completedOrderConditions.paymentState })
        .getCount(),
      this.dataSource
        .getRepository(ProductoEntityORM)
        .createQueryBuilder('producto')
        .where('producto.cantidad <= :threshold', { threshold: 20 })
        .getCount(),
      this.dataSource
        .getRepository(PedidoEntityORM)
        .createQueryBuilder('pedido')
        .innerJoin(PagoEntityORM, 'pago', 'pago.pedidoId = pedido.pedidoId')
        .select("TO_CHAR(DATE_TRUNC('month', pago.fechaPago), 'YYYY-MM')", 'period')
        .addSelect('SUM(pago.monto)', 'value')
        .andWhere('pago.estado = :paymentState', { paymentState: completedOrderConditions.paymentState })
        .andWhere(`pago.fechaPago >= (CURRENT_DATE - INTERVAL '5 months')`)
        .groupBy("DATE_TRUNC('month', pago.fechaPago)")
        .orderBy("DATE_TRUNC('month', pago.fechaPago)", 'ASC')
        .getRawMany<RawValueRow>(),
      this.dataSource
        .getRepository(PedidoEntityORM)
        .createQueryBuilder('pedido')
        .innerJoin(PagoEntityORM, 'pago', 'pago.pedidoId = pedido.pedidoId')
        .andWhere('pago.estado = :paymentState', { paymentState: completedOrderConditions.paymentState })
        .andWhere(`pago.fechaPago >= (CURRENT_DATE - INTERVAL '5 months')`)
        .select("TO_CHAR(DATE_TRUNC('month', pago.fechaPago), 'YYYY-MM')", 'period')
        .addSelect('COUNT(*)', 'value')
        .groupBy("DATE_TRUNC('month', pago.fechaPago)")
        .orderBy("DATE_TRUNC('month', pago.fechaPago)", 'ASC')
        .getRawMany<RawValueRow>(),
      this.dataSource
        .getRepository(KardexEntityORM)
        .createQueryBuilder('kardex')
        .select("TO_CHAR(DATE_TRUNC('month', kardex.fechaMovimiento), 'YYYY-MM')", 'period')
        .addSelect("COALESCE(SUM(CASE WHEN kardex.tipoMovimiento = 'ENTRADA' THEN kardex.cantidad ELSE 0 END), 0)", 'entradas')
        .addSelect("COALESCE(SUM(CASE WHEN kardex.tipoMovimiento = 'SALIDA' THEN kardex.cantidad ELSE 0 END), 0)", 'salidas')
        .where(`kardex.fechaMovimiento >= (CURRENT_DATE - INTERVAL '5 months')`)
        .groupBy("DATE_TRUNC('month', kardex.fechaMovimiento)")
        .orderBy("DATE_TRUNC('month', kardex.fechaMovimiento)", 'ASC')
        .getRawMany<RawInventoryRow>(),
      this.dataSource
        .getRepository(PedidoDetalleEntityORM)
        .createQueryBuilder('detalle')
        .innerJoin(PedidoEntityORM, 'pedido', 'pedido.pedidoId = detalle.pedidoId')
        .innerJoin(PagoEntityORM, 'pago', 'pago.pedidoId = pedido.pedidoId')
        .select('COALESCE(SUM(detalle.cantidad), 0)', 'value')
        .andWhere('pago.estado = :paymentState', { paymentState: completedOrderConditions.paymentState })
        .getRawOne<{ value: string | number }>(),
      this.dataSource
        .getRepository(PedidoDetalleEntityORM)
        .createQueryBuilder('detalle')
        .innerJoin(PedidoEntityORM, 'pedido', 'pedido.pedidoId = detalle.pedidoId')
        .innerJoin(PagoEntityORM, 'pago', 'pago.pedidoId = pedido.pedidoId')
        .innerJoin(ProductoEntityORM, 'producto', 'producto.productoId = detalle.productoId')
        .select('producto.productoId', 'productId')
        .addSelect('producto.nombre', 'name')
        .addSelect('COALESCE(SUM(detalle.cantidad), 0)', 'soldQuantity')
        .addSelect('COALESCE(SUM(detalle.subtotal), 0)', 'revenue')
        .andWhere('pago.estado = :paymentState', { paymentState: completedOrderConditions.paymentState })
        .groupBy('producto.productoId')
        .addGroupBy('producto.nombre')
        .orderBy('COALESCE(SUM(detalle.cantidad), 0)', 'DESC')
        .limit(5)
        .getRawMany<RawTopProductRow>(),
      this.dataSource
        .getRepository(PedidoEntityORM)
        .createQueryBuilder('pedido')
        .innerJoin(PagoEntityORM, 'pago', 'pago.pedidoId = pedido.pedidoId')
        .innerJoin(ClienteEntityORM, 'cliente', 'cliente.clienteId = pedido.clienteId')
        .innerJoin(UsuarioEntityORM, 'usuario', 'usuario.usuarioId = cliente.usuarioId')
        .leftJoin(PedidoDetalleEntityORM, 'detalle', 'detalle.pedidoId = pedido.pedidoId')
        .select('pedido.pedidoId', 'orderId')
        .addSelect('pedido.total', 'total')
        .addSelect('pedido.estado', 'state')
        .addSelect('pago.fechaPago', 'date')
        .addSelect('pago.estado', 'paymentStatus')
        .addSelect('pago.metodoPago', 'paymentMethod')
        .addSelect('COALESCE(SUM(detalle.cantidad), 0)', 'itemsCount')
        .addSelect('usuario.username', 'username')
        .addSelect('usuario.primer_nombre', 'firstName')
        .addSelect('usuario.primer_apellido', 'lastName')
        .andWhere('pago.estado = :paymentState', { paymentState: completedOrderConditions.paymentState })
        .groupBy('pedido.pedidoId')
        .addGroupBy('pedido.total')
        .addGroupBy('pedido.estado')
        .addGroupBy('pago.fechaPago')
        .addGroupBy('pago.estado')
        .addGroupBy('pago.metodoPago')
        .addGroupBy('usuario.username')
        .addGroupBy('usuario.primer_nombre')
        .addGroupBy('usuario.primer_apellido')
        .orderBy('pago.fechaPago', 'DESC')
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
      itemsCount: toNumber(row.itemsCount),
      state: row.state,
      paymentStatus: row.paymentStatus,
      paymentMethod: row.paymentMethod,
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