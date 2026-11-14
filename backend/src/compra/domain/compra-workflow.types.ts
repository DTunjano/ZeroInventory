export const COMPRA_ESTADOS = [
  'BORRADOR',
  'RECIBIDA',
  'CANCELADA',
  'LEGACY',
] as const;
export type CompraEstado = (typeof COMPRA_ESTADOS)[number];
export type CompraAccion = 'CREADA' | 'ACTUALIZADA' | 'RECIBIDA' | 'CANCELADA';
export interface CompraLineaInput {
  productoId: number;
  cantidad: number;
  costoUnitario: number;
}
export interface CompraDraftInput {
  proveedorId: number;
  observaciones?: string;
  lineas: CompraLineaInput[];
}
export interface CompraDraft extends CompraDraftInput {
  total: number;
  lineas: (CompraLineaInput & { subtotal: number })[];
}
export interface CompraLinea extends CompraLineaInput {
  compraDetalleId: number;
  productoNombre: string;
  sku: string;
  subtotal: number;
}
export interface CompraResumen {
  compraId: number;
  proveedorId: number;
  proveedorNombre: string;
  usuarioId: number;
  total: number;
  fechaCompra: Date;
  estado: CompraEstado;
  version: number;
  observaciones: string | null;
  recibidaPor: number | null;
  recibidaEn: Date | null;
  canceladaPor: number | null;
  canceladaEn: Date | null;
  motivoCancelacion: string | null;
}
export interface CompraSnapshot {
  proveedorNombre: string;
  total: number;
  lineas: {
    productoId: number;
    productoNombre: string;
    sku: string;
    cantidad: number;
    costoUnitario: number;
    subtotal: number;
  }[];
}
export interface CompraEvento {
  eventoId: number;
  accion: CompraAccion;
  usuarioId: number;
  version: number;
  fecha: Date;
  motivo: string | null;
  snapshot: CompraSnapshot;
}
export interface CompraDetalle extends CompraResumen {
  lineas: CompraLinea[];
  historial: CompraEvento[];
}
export interface CompraFiltros {
  proveedorId?: number;
  usuarioId?: number;
  estado?: CompraEstado;
  page?: number;
  limit?: number;
}
export interface CompraPagina {
  data: CompraResumen[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
