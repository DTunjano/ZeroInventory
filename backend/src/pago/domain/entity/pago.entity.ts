export enum MetodoPagoEnum {
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA',
}

export enum EstadoPagoEnum {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

export class Pago {
  constructor(
    readonly pagoId: number,
    readonly pedidoId: number,
    readonly metodoPago: MetodoPagoEnum,
    readonly monto: number,
    readonly estado: EstadoPagoEnum,
    readonly fechaPago: Date,
  ) {}
}
