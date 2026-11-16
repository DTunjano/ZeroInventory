import type { EstadoPedidoEnum } from './entity/pedido.entity';
export const PEDIDO_ACTIONS = [
  'ENVIAR',
  'ENTREGAR',
  'CANCELAR',
  'DEVOLVER',
  'APROBAR_PAGO',
  'RECHAZAR_PAGO',
  'REINTENTAR_PAGO',
  'REGISTRAR_REEMBOLSO',
] as const;
export type PedidoAction = (typeof PEDIDO_ACTIONS)[number];
export interface PedidoCommand {
  version: number;
  motivo: string;
  pagoId?: number;
}
export interface PedidoActor {
  usuarioId: number;
  customerOnly: boolean;
}
export interface PedidoFilters {
  clienteId?: number;
  direccionId?: number;
  estado?: EstadoPedidoEnum;
  page?: number;
  limit?: number;
}
export interface OwnPedidoFilters {
  estado?: EstadoPedidoEnum;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'fecha_desc' | 'fecha_asc' | 'total_desc' | 'total_asc';
}
export interface PedidoSummary {
  pedidoId: number;
  clienteId: number;
  direccionId: number;
  numeroPedidoUsuario: number;
  estado: EstadoPedidoEnum;
  total: number;
  fecha: Date;
  version: number;
}
export interface PedidoLine {
  pedidoDetalleId: number;
  pedidoId: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
export interface PedidoPayment {
  pagoId: number;
  pedidoId: number;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'WOMPI';
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'ANULADO';
  monto: number;
  fechaPago: Date;
  wompi?: { environment: 'sandbox'; reference: string; transactionId: string | null; status: string | null };
}
export interface PedidoRefund {
  estado: 'PENDIENTE' | 'REGISTRADO';
  monto: number;
  creadaEn: Date;
  registradaEn: Date | null;
  registradaPor: number | null;
  motivo: string | null;
}
export interface PedidoSnapshot {
  estado: EstadoPedidoEnum;
  total: number;
  detalles: PedidoLine[];
  pagos: PedidoPayment[];
  reembolso: PedidoRefund | null;
}
export interface PedidoEvent {
  eventoId: number;
  version: number;
  accion: PedidoAction | 'CREADO' | 'WOMPI_VERIFICADO';
  usuarioId: number | null;
  origen: 'USUARIO' | 'WOMPI';
  motivo: string;
  fecha: Date;
  snapshot: PedidoSnapshot;
}
export interface PedidoView extends PedidoSummary {
  detalles: PedidoLine[];
  pago: PedidoPayment | null;
  pagos: PedidoPayment[];
  reembolso: PedidoRefund | null;
  historial: PedidoEvent[];
}
export interface PedidoPage {
  data: PedidoSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
