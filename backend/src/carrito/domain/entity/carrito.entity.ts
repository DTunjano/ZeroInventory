export enum EstadoCarritoEnum {
  ABIERTO = 'ABIERTO',
  CERRADO = 'CERRADO',
}

export class Carrito {
  readonly carritoId: number = 0;
  usuarioId: number = 0;
  estado: EstadoCarritoEnum = EstadoCarritoEnum.ABIERTO;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(
    carritoId: number,
    usuarioId: number,
    estado: EstadoCarritoEnum,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.carritoId = carritoId;
    this.usuarioId = usuarioId;
    this.estado = estado;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
