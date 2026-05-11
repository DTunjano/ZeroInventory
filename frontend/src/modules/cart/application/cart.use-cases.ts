import type {
  CartProductSnapshot,
  CheckoutCartInput,
} from '../domain/cart.models'
import { cartApi } from '../infrastructure/cart.api'

export function getMyCart() {
  return cartApi.getMyCart()
}

export function addToCart(producto: CartProductSnapshot, quantity = 1) {
  return cartApi.addItem({ productoId: producto.productoId, cantidad: quantity })
}

export function updateCartItemQuantity(carritoDetalleId: number, cantidad: number) {
  return cartApi.updateItemQuantity(carritoDetalleId, { cantidad })
}

export function removeFromCart(carritoDetalleId: number) {
  return cartApi.removeItem(carritoDetalleId)
}

export function clearCart() {
  return cartApi.clearCart()
}

export function checkoutCart(input: CheckoutCartInput) {
  return cartApi.checkout(input)
}
