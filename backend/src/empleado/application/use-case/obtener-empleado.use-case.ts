import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmpleadoConRoles } from '../../domain/entity/empleado.entity';
import { EmpleadoRepositoryPort } from '../../domain/port/out/empleado.repository.port';

@Injectable()
export class ObtenerEmpleadoUseCase {
  constructor(private readonly empleadoRepo: EmpleadoRepositoryPort) {}

  async ejecutar(empleadoId: number): Promise<EmpleadoConRoles> {
    const empleado = await this.empleadoRepo.obtenerPorId(empleadoId);
    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado');
    }

    return {
      ...empleado,
      nombreCompleto: empleado.nombre,
    };
  }
}
