export class AjusteInventario {
  readonly ajusteInventarioId: number = 0;
  productoId: number = 0;
  usuarioId: number = 0;
  cantidad: number = 0;
  motivo: string = '';
  fecha: Date = new Date();

  constructor(
    ajusteInventarioId: number,
    productoId: number,
    usuarioId: number,
    cantidad: number,
    motivo: string,
    fecha: Date,
  ) {
    this.ajusteInventarioId = ajusteInventarioId;
    this.productoId = productoId;
    this.usuarioId = usuarioId;
    this.cantidad = cantidad;
    this.motivo = motivo;
    this.fecha = fecha;
  }
}
