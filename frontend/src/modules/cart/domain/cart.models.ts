export interface CartProductSnapshot {
  productoId: number
  nombre: string
  precio: number
  stockDisponible?: number
  imagenUrl?: string | null
}

export interface CartItem {
  producto: CartProductSnapshot
  quantity: number
}

export interface OpenCartItemView {
  carritoDetalleId: number
  productoId: number
  cantidad: number
  precioUnitario: number
  subtotal: number
  productoNombre: string
}

export interface OpenCartView {
  carritoId: number
  usuarioId: number
  items: OpenCartItemView[]
  total: number
}

export interface AddCartItemInput {
  productoId: number
  cantidad: number
}

export interface UpdateCartItemQuantityInput {
  cantidad: number
}

export interface CheckoutCartInput {
  direccionId: number
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA'
}

export interface CheckoutCartResult {
  pedidoId: number
  total: number
  numeroPedidoUsuario: number
}

export interface CheckoutStockIssueProduct {
  nombre: string
  stockDisponible: number
  cantidadSolicitada: number
}

export interface CheckoutStockInsufficientResponse {
  error: 'STOCK_INSUFFICIENT'
  message: string
  productos: CheckoutStockIssueProduct[]
}
