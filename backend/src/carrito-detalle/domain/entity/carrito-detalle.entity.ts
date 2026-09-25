export class CarritoDetalle {
  readonly carritoDetalleId: number = 0;
  carritoId: number = 0;
  productoId: number = 0;
  cantidad: number = 0;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(
    carritoDetalleId: number,
    carritoId: number,
    productoId: number,
    cantidad: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.carritoDetalleId = carritoDetalleId;
    this.carritoId = carritoId;
    this.productoId = productoId;
    this.cantidad = cantidad;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
