import { Injectable } from '@nestjs/common';
import { EmpleadoRepositoryPort, PaginatedEmpleados } from '../../domain/port/out/empleado.repository.port';

@Injectable()
export class ListarEmpleadosUseCase {
  constructor(private readonly empleadoRepo: EmpleadoRepositoryPort) {}

  async ejecutar(params: {
    nombre?: string;
    email?: string;
    estado?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedEmpleados> {
    return this.empleadoRepo.listar(params);
  }
}
