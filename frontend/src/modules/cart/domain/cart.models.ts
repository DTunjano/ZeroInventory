export interface CartProductSnapshot {
  productoId: number
  nombre: string
  precio: number
}

export interface CartItem {
  producto: CartProductSnapshot
  quantity: number
}
