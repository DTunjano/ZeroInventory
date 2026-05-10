export enum EstadoPedidoEnum {
  COMPLETADO = 'COMPLETADO',
  CONFIRMADO = 'CONFIRMADO',
  ENVIADO = 'ENVIADO',
  CANCELADO = 'CANCELADO',
  DEVUELTO = 'DEVUELTO',
}

export class Pedido {
  readonly pedidoId: number = 0;
  clienteId: number = 0;
  direccionId: number = 0;
  estado: EstadoPedidoEnum = EstadoPedidoEnum.CONFIRMADO;
  total: number = 0;
  fecha: Date = new Date();

  constructor(
    pedidoId: number,
    clienteId: number,
    direccionId: number,
    estado: EstadoPedidoEnum,
    total: number,
    fecha: Date,
  ) {
    this.pedidoId = pedidoId;
    this.clienteId = clienteId;
    this.direccionId = direccionId;
    this.estado = estado;
    this.total = total;
    this.fecha = fecha;
  }
}
