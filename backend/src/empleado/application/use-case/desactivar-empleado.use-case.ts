import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmpleadoConRoles } from '../../domain/entity/empleado.entity';
import { EmpleadoRepositoryPort } from '../../domain/port/out/empleado.repository.port';

@Injectable()
export class DesactivarEmpleadoUseCase {
  constructor(private readonly empleadoRepo: EmpleadoRepositoryPort) {}

  async ejecutar(empleadoId: number): Promise<EmpleadoConRoles> {
    const empleadoExistente = await this.empleadoRepo.obtenerPorId(empleadoId);
    if (!empleadoExistente) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const empleadoDesactivado = await this.empleadoRepo.cambiarEstado(
      empleadoId,
      'INACTIVO',
    );

    return {
      ...empleadoDesactivado,
      roles: ['EMPLOYEE'],
      nombreCompleto: empleadoDesactivado.nombre,
    };
  }
}
