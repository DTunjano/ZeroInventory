export class Direccion {
  readonly direccionId: number = 0;
  clienteId: number | null = null;
  proveedorId: number | null = null;
  lineaDir: string = '';
  barrio: string = '';
  codigoPostal: string | null = null;
  infoAdiccional: string | null = null;
  esPredeterminada: boolean = false;
  estado: boolean = true;

  constructor(
    direccionId: number,
    clienteId: number | null,
    proveedorId: number | null,
    lineaDir: string,
    barrio: string,
    codigoPostal: string | null,
    infoAdiccional: string | null,
    esPredeterminada: boolean = false,
    estado: boolean = true,
  ) {
    this.direccionId = direccionId;
    this.clienteId = clienteId;
    this.proveedorId = proveedorId;
    this.lineaDir = lineaDir;
    this.barrio = barrio;
    this.codigoPostal = codigoPostal;
    this.infoAdiccional = infoAdiccional;
    this.esPredeterminada = esPredeterminada;
    this.estado = estado;
  }
}
