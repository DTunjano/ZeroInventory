export enum EmpleadoEstadoEnum {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export class Empleado {
  constructor(
    readonly empleadoId: number | null,
    readonly nombre: string,
    readonly email: string,
    public estado: EmpleadoEstadoEnum,
    readonly usuarioId: number | null,
    readonly telefono: string | null,
    readonly documento: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}

export interface EmpleadoConRoles extends Empleado {
  roles: string[];
  nombreCompleto: string;
}
