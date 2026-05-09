export class PedidoDetalle {
  constructor(
    readonly pedidoDetalleId: number,
    readonly pedidoId: number,
    readonly productoId: number,
    readonly cantidad: number,
    readonly precioUnitario: number,
    readonly subtotal: number,
  ) {}
}
