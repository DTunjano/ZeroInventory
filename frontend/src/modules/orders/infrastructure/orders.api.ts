import { http } from '@/infrastructure/http/http'
import type { Order, OrderAction, OrderCommand, OrderPage, OrderStatus } from '../domain/orders.models'

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
  async list(params: { page: number; estado?: OrderStatus }): Promise<OrderPage> {
    return (await http.get<OrderPage>('/pedidos', {params:{...params,limit:10}})).data
  }
  async operate(id: number,action: OrderAction,command: OrderCommand,customer = false): Promise<Order> {
    return (await http.post<Order>(customer ? `/pedidos/me/${id}/cancel` : `/pedidos/${id}/actions/${action}`,command)).data
  }
}

export const ordersApi = new OrdersHttpApi()
