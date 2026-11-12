import { Empleado, EmpleadoConRoles } from '../../entity/empleado.entity';

export interface FiltrosEmpleadoDTO {
  nombre?: string;
  email?: string;
  estado?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedEmpleados {
  data: EmpleadoConRoles[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class EmpleadoRepositoryPort {
  abstract crear(empleado: Empleado): Promise<Empleado>;
  abstract obtenerPorId(empleadoId: number): Promise<EmpleadoConRoles | null>;
  abstract obtenerPorEmail(email: string): Promise<EmpleadoConRoles | null>;
  abstract obtenerPorDocumento(documento: string): Promise<EmpleadoConRoles | null>;
  abstract listar(filtros?: FiltrosEmpleadoDTO): Promise<PaginatedEmpleados>;
  abstract actualizar(empleadoId: number, datos: Partial<Empleado>, passwordHash?: string): Promise<Empleado>;
  abstract cambiarEstado(empleadoId: number, estado: string): Promise<Empleado>;
}
