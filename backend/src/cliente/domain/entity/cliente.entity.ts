export enum TipoDocumentoEnum {
  CC = 'CC',
  CE = 'CE',
  PASAPORTE = 'PASAPORTE',
}

export class Cliente {
  readonly clienteId: number = 0;
  usuarioId: number = 0;
  tipoDocumento: TipoDocumentoEnum = TipoDocumentoEnum.CC;
  documento: string = '';
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(
    clienteId: number,
    usuarioId: number,
    tipoDocumento: TipoDocumentoEnum,
    documento: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.clienteId = clienteId;
    this.usuarioId = usuarioId;
    this.tipoDocumento = tipoDocumento;
    this.documento = documento;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
