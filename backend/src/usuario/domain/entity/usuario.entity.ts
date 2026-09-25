export class Usuario {
  readonly usuarioId: number = 0;
  username: string = '';
  password: string = '';
  primerNombre: string | null = null;
  segundoNombre: string | null = null;
  primerApellido: string | null = null;
  segundoApellido: string | null = null;
  isActive: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(
    usuarioId: number,
    username: string,
    password: string,
    primerNombre: string | null,
    segundoNombre: string | null,
    primerApellido: string | null,
    segundoApellido: string | null,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.usuarioId = usuarioId;
    this.username = username;
    this.password = password;
    this.primerNombre = primerNombre;
    this.segundoNombre = segundoNombre;
    this.primerApellido = primerApellido;
    this.segundoApellido = segundoApellido;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
