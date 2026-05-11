import { http } from '@/infrastructure/http/http'

import type {
  AddCartItemInput,
  CheckoutCartInput,
  CheckoutCartResult,
  OpenCartView,
  UpdateCartItemQuantityInput,
} from '../domain/cart.models'

export const cartQueryKey = ['cart', 'me'] as const

export class CartHttpApi {
  async getMyCart(): Promise<OpenCartView> {
    const { data } = await http.get<OpenCartView>('/carritos/me')
    return data
  }

  async addItem(input: AddCartItemInput): Promise<OpenCartView> {
    const { data } = await http.post<OpenCartView>('/carritos/me/items', input)
    return data
  }

  async updateItemQuantity(
    carritoDetalleId: number,
    input: UpdateCartItemQuantityInput,
  ): Promise<OpenCartView> {
    const { data } = await http.put<OpenCartView>(
      `/carritos/me/items/${carritoDetalleId}`,
      input,
    )
    return data
  }

  async removeItem(carritoDetalleId: number): Promise<OpenCartView> {
    const { data } = await http.delete<OpenCartView>(`/carritos/me/items/${carritoDetalleId}`)
    return data
  }

  async clearCart(): Promise<OpenCartView> {
    const { data } = await http.delete<OpenCartView>('/carritos/me')
    return data
  }

  async checkout(input: CheckoutCartInput): Promise<CheckoutCartResult> {
    const { data } = await http.post<CheckoutCartResult>('/carritos/me/checkout', input)
    return data
  }
}

export const cartApi = new CartHttpApi()