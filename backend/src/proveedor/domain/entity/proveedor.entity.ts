export class Proveedor {
  readonly proveedorId: number = 0;
  nombre: string = '';
  nombreTitular: string | null = null;
  telefono: string | null = null;
  email: string | null = null;
  isActive: boolean = true;

  constructor(
    proveedorId: number,
    nombre: string,
    nombreTitular: string | null,
    telefono: string | null,
    email: string | null,
    isActive: boolean = true,
  ) {
    this.proveedorId = proveedorId;
    this.nombre = nombre;
    this.nombreTitular = nombreTitular;
    this.telefono = telefono;
    this.email = email;
    this.isActive = isActive;
  }
}
