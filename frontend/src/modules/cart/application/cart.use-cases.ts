import type {
  CartProductSnapshot,
  CheckoutCartInput,
} from '../domain/cart.models'
import { cartApi } from '../infrastructure/cart.api'
import { useCartStore } from './cart.store'

export function getMyCart() {
  return cartApi.getMyCart()
}

export async function addToCart(producto: CartProductSnapshot, quantity = 1) {
  const response = await cartApi.addItem({ productoId: producto.productoId, cantidad: quantity })

  // Actualizar el store local con los items devueltos
  if (response.items && Array.isArray(response.items)) {
    const items: Record<number, any> = {}
    response.items.forEach((item) => {
      items[item.productoId] = {
        producto: {
          productoId: item.productoId,
          nombre: item.productoNombre,
          precio: item.precioUnitario,
        },
        quantity: item.cantidad,
      }
    })
    useCartStore.setState({ items })
  }

  return response
}

export async function updateCartItemQuantity(carritoDetalleId: number, cantidad: number) {
  const response = await cartApi.updateItemQuantity(carritoDetalleId, { cantidad })
  updateStoreFromResponse(response)
  return response
}

export async function removeFromCart(carritoDetalleId: number) {
  const response = await cartApi.removeItem(carritoDetalleId)
  updateStoreFromResponse(response)
  return response
}

export async function clearCart() {
  const response = await cartApi.clearCart()
  useCartStore.setState({ items: {} })
  return response
}

export function checkoutCart(input: CheckoutCartInput) {
  return cartApi.checkout(input)
}

function updateStoreFromResponse(response: any) {
  if (response.items && Array.isArray(response.items)) {
    const items: Record<number, any> = {}
    response.items.forEach((item: any) => {
      items[item.productoId] = {
        producto: {
          productoId: item.productoId,
          nombre: item.productoNombre,
          precio: item.precioUnitario,
        },
        quantity: item.cantidad,
      }
    })
    useCartStore.setState({ items })
  }
}
