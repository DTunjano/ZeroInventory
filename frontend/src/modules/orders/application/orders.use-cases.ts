import { ordersApi } from '../infrastructure/orders.api'
import type { Order } from '../domain/orders.models'

export function getMyOrders() {
  return ordersApi.getMyOrders()
}

export function getOrderById(pedidoId: number) {
  return ordersApi.getOrderById(pedidoId)
}
