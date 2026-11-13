import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmpleadoConRoles, EmpleadoEstadoEnum } from '../../domain/entity/empleado.entity';
import { EmpleadoRepositoryPort } from '../../domain/port/out/empleado.repository.port';

@Injectable()
export class ActivarEmpleadoUseCase {
  constructor(
    private readonly empleadoRepo: EmpleadoRepositoryPort,
  ) {}

  async ejecutar(empleadoId: number): Promise<EmpleadoConRoles> {
    const empleado = await this.empleadoRepo.obtenerPorId(empleadoId);
    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const empleadoActualizado = await this.empleadoRepo.cambiarEstado(
      empleadoId,
      EmpleadoEstadoEnum.ACTIVO,
    );

    return {
      ...empleadoActualizado,
      roles: ['EMPLOYEE'],
      nombreCompleto: empleadoActualizado.nombre,
    };
  }
}
