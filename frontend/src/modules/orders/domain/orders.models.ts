export interface OrderItem {
  pedidoDetalleId: number;
  pedidoId: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface OrderPayment {
  pagoId: number;
  pedidoId: number;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA';
  monto: number;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fechaPago: Date | string;
}

export type OrderStatus = 'CONFIRMADO' | 'COMPLETADO' | 'ENVIADO' | 'CANCELADO' | 'DEVUELTO';

export interface Order {
  pedidoId: number;
  numeroPedidoUsuario: number;
  clienteId: number;
  direccionId: number;
  estado: OrderStatus;
  total: number;
  fecha: Date | string;
  detalles: OrderItem[];
  pago: OrderPayment | null;
}

export type GetOrdersInput = undefined;
