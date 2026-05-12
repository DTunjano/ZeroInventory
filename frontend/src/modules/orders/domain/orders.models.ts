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
  fechaPago: Date;
}

export interface Order {
  pedidoId: number;
  clienteId: number;
  direccionId: number;
  estado: 'CONFIRMADO' | 'COMPLETADO' | 'ENVIADO' | 'CANCELADO' | 'DEVUELTO';
  total: number;
  fecha: Date;
  detalles?: OrderItem[];
  pago?: OrderPayment;
}

export type GetOrdersInput = undefined;
