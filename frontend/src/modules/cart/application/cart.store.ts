import { create } from 'zustand'

import type { CartItem, CartProductSnapshot } from '../domain/cart.models'

export interface CartState {
  items: Record<number, CartItem>

  add: (producto: CartProductSnapshot, quantity?: number) => void
  remove: (productoId: number) => void
  clear: () => void
}

export const useCartStore = create<CartState>((set) => ({
  items: {},

  add: (producto, quantity = 1) => {
    set((state) => {
      const current = state.items[producto.productoId]
      const nextQuantity = (current?.quantity ?? 0) + quantity

      return {
        items: {
          ...state.items,
          [producto.productoId]: {
            producto,
            quantity: nextQuantity,
          },
        },
      }
    })
  },

  remove: (productoId) => {
    set((state) => {
      const { [productoId]: _, ...rest } = state.items
      return { items: rest }
    })
  },

  clear: () => set({ items: {} }),
}))
