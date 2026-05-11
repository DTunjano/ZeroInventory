import { useCartStore } from './cart.store'
import type { CartProductSnapshot } from '../domain/cart.models'

export function addToCart(producto: CartProductSnapshot, quantity = 1): void {
  useCartStore.getState().add(producto, quantity)
}

export function removeFromCart(productoId: number): void {
  useCartStore.getState().remove(productoId)
}

export function clearCart(): void {
  useCartStore.getState().clear()
}
