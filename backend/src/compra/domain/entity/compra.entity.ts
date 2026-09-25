export class Compra {
  readonly compraId: number = 0;
  proveedorId: number = 0;
  usuarioId: number = 0;
  total: number = 0;
  fechaCompra: Date = new Date();

  constructor(
    compraId: number,
    proveedorId: number,
    usuarioId: number,
    total: number,
    fechaCompra: Date,
  ) {
    this.compraId = compraId;
    this.proveedorId = proveedorId;
    this.usuarioId = usuarioId;
    this.total = total;
    this.fechaCompra = fechaCompra;
  }
}
