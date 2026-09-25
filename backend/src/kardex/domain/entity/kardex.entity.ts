export enum TipoMovimientoEnum {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
}

export enum TipoReferenciaEnum {
  COMPRA = 'COMPRA',
  VENTA = 'VENTA',
  AJUSTE = 'AJUSTE',
}

export class Kardex {
  readonly kardexId: number = 0;
  productoId: number = 0;
  tipoMovimiento: TipoMovimientoEnum = TipoMovimientoEnum.ENTRADA;
  cantidad: number = 0;
  costoUnitario: number = 0;
  valorTotal: number = 0;
  referenciaId: number = 0;
  tipoReferencia: TipoReferenciaEnum = TipoReferenciaEnum.COMPRA;
  fechaMovimiento: Date = new Date();

  constructor(
    kardexId: number,
    productoId: number,
    tipoMovimiento: TipoMovimientoEnum,
    cantidad: number,
    costoUnitario: number,
    valorTotal: number,
    referenciaId: number,
    tipoReferencia: TipoReferenciaEnum,
    fechaMovimiento: Date,
  ) {
    this.kardexId = kardexId;
    this.productoId = productoId;
    this.tipoMovimiento = tipoMovimiento;
    this.cantidad = cantidad;
    this.costoUnitario = costoUnitario;
    this.valorTotal = valorTotal;
    this.referenciaId = referenciaId;
    this.tipoReferencia = tipoReferencia;
    this.fechaMovimiento = fechaMovimiento;
  }
}
