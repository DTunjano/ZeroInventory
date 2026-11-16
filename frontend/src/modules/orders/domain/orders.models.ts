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
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'WOMPI';
  monto: number;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'ANULADO';
  fechaPago: Date | string;
  wompi?: { environment: 'sandbox'; reference: string; transactionId: string | null; status: string | null };
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
  version: number;
  pagos: OrderPayment[];
  reembolso: { estado: 'PENDIENTE' | 'REGISTRADO'; monto: number; creadaEn: string; registradaEn: string | null; registradaPor: number | null; motivo: string | null } | null;
  historial: { eventoId: number; version: number; accion: OrderAction | 'CREADO' | 'WOMPI_VERIFICADO'; usuarioId: number | null; origen: 'USUARIO' | 'WOMPI'; motivo: string; fecha: string; snapshot: { estado: OrderStatus; total: number; detalles: OrderItem[]; pagos: OrderPayment[] } }[];
}

export type OrderAction = 'ENVIAR' | 'ENTREGAR' | 'CANCELAR' | 'DEVOLVER' | 'APROBAR_PAGO' | 'RECHAZAR_PAGO' | 'REINTENTAR_PAGO' | 'REGISTRAR_REEMBOLSO';
export interface OrderCommand { version: number; motivo: string; pagoId?: number }
export interface OrderSummary { pedidoId: number; numeroPedidoUsuario: number; clienteId: number; estado: OrderStatus; total: number; fecha: string; version: number }
export interface OrderPage { data: OrderSummary[]; total: number; totalPages: number; page: number; limit: number }

export type GetOrdersInput = undefined;
