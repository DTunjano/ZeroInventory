import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmpleadoConRoles, EmpleadoEstadoEnum } from '../../domain/entity/empleado.entity';
import { EmpleadoRepositoryPort } from '../../domain/port/out/empleado.repository.port';
import { UsuarioRepository } from '../../../usuario/domain/repository/usuario.repository';

@Injectable()
export class ToggleEmpleadoUseCase {
  constructor(
    private readonly empleadoRepo: EmpleadoRepositoryPort,
    private readonly usuarioRepo: UsuarioRepository,
  ) {}

  async ejecutar(empleadoId: number): Promise<EmpleadoConRoles> {
    const empleado = await this.empleadoRepo.obtenerPorId(empleadoId);
    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const nuevoEstado =
      empleado.estado === EmpleadoEstadoEnum.ACTIVO
        ? EmpleadoEstadoEnum.INACTIVO
        : EmpleadoEstadoEnum.ACTIVO;

    const empleadoActualizado = await this.empleadoRepo.cambiarEstado(
      empleadoId,
      nuevoEstado,
    );

    // Sincronizar estado del usuario asociado
    if (empleado.usuarioId) {
      const usuario = await this.usuarioRepo.getById(empleado.usuarioId);
      if (usuario) {
        usuario.isActive = nuevoEstado === EmpleadoEstadoEnum.ACTIVO;
        await this.usuarioRepo.update(usuario);
      }
    }

    return {
      ...empleadoActualizado,
      roles: ['EMPLOYEE'],
      nombreCompleto: empleadoActualizado.nombre,
    } as EmpleadoConRoles;
  }
}
