export class Direccion {
  readonly direccionId: number = 0;
  clienteId: number = 0;
  lineaDir: string = '';
  barrio: string = '';
  codigoPostal: string | null = null;
  infoAdiccional: string | null = null;

  constructor(
    direccionId: number,
    clienteId: number,
    lineaDir: string,
    barrio: string,
    codigoPostal: string | null,
    infoAdiccional: string | null,
  ) {
    this.direccionId = direccionId;
    this.clienteId = clienteId;
    this.lineaDir = lineaDir;
    this.barrio = barrio;
    this.codigoPostal = codigoPostal;
    this.infoAdiccional = infoAdiccional;
  }
}
