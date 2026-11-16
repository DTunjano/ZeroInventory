import { ordersApi } from '../infrastructure/orders.api'

export function getMyOrders(params?: { estado?: string | string[]; dateFrom?: string; dateTo?: string; sortBy?: string }) {
  return ordersApi.getMyOrders(params)
}

export function getOrderById(pedidoId: number) {
  return ordersApi.getOrderById(pedidoId)
}
