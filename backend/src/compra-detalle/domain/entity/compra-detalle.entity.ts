export class CompraDetalle {
  readonly compraDetalleId: number = 0;
  compraId: number = 0;
  productoId: number = 0;
  cantidad: number = 0;
  costoUnitario: number = 0;
  subtotal: number = 0;

  constructor(
    compraDetalleId: number,
    compraId: number,
    productoId: number,
    cantidad: number,
    costoUnitario: number,
    subtotal: number,
  ) {
    this.compraDetalleId = compraDetalleId;
    this.compraId = compraId;
    this.productoId = productoId;
    this.cantidad = cantidad;
    this.costoUnitario = costoUnitario;
    this.subtotal = subtotal;
  }
}
