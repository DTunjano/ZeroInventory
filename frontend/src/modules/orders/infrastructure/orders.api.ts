import { http } from '@/infrastructure/http/http'
import type { Order } from '../domain/orders.models'

export const ordersQueryKey = ['orders', 'me'] as const

export class OrdersHttpApi {
  async getMyOrders(params?: {
    estado?: string | string[]
    dateFrom?: string
    dateTo?: string
    sortBy?: string
  }): Promise<Order[]> {
    const { data } = await http.get<Order[]>('/pedidos/me', { params })
    return data
  }

  async getOrderById(pedidoId: number): Promise<Order> {
    const { data } = await http.get<Order>(`/pedidos/${pedidoId}`)
    return data
  }
}

export const ordersApi = new OrdersHttpApi()
