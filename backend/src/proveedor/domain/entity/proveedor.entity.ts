export class Proveedor {
  readonly proveedorId: number = 0;
  nombre: string = '';
  telefono: string | null = null;
  email: string | null = null;

  constructor(
    proveedorId: number,
    nombre: string,
    telefono: string | null,
    email: string | null,
  ) {
    this.proveedorId = proveedorId;
    this.nombre = nombre;
    this.telefono = telefono;
    this.email = email;
  }
}
