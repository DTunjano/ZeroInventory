import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmpleadoConRoles } from '../../domain/entity/empleado.entity';
import { EmpleadoRepositoryPort } from '../../domain/port/out/empleado.repository.port';
import { ActualizarEmpleadoDTO } from '../dto/actualizar-empleado.dto';

@Injectable()
export class ActualizarEmpleadoUseCase {
  constructor(private readonly empleadoRepo: EmpleadoRepositoryPort) {}

  async ejecutar(
    empleadoId: number,
    dto: ActualizarEmpleadoDTO,
  ): Promise<EmpleadoConRoles> {
    const empleadoExistente = await this.empleadoRepo.obtenerPorId(empleadoId);
    if (!empleadoExistente) {
      throw new NotFoundException('Empleado no encontrado');
    }

    if (dto.email && dto.email !== empleadoExistente.email) {
      const emailExistente = await this.empleadoRepo.obtenerPorEmail(dto.email);
      if (emailExistente) {
        throw new ConflictException('Ya existe un empleado con ese email');
      }
    }

    if (dto.documento && dto.documento !== empleadoExistente.documento) {
      const documentoExistente = await this.empleadoRepo.obtenerPorDocumento(dto.documento);
      if (documentoExistente) {
        throw new ConflictException('Ya existe un empleado con ese documento');
      }
    }

    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const datosActualizar: Partial<EmpleadoConRoles> = {
      nombre: dto.nombre ?? empleadoExistente.nombre,
      email: dto.email ?? empleadoExistente.email,
      documento: dto.documento !== undefined ? dto.documento : empleadoExistente.documento,
      telefono: dto.telefono !== undefined ? dto.telefono : empleadoExistente.telefono,
    };


    const empleadoActualizado = await this.empleadoRepo.actualizar(empleadoId, datosActualizar, passwordHash);

    return {
      ...empleadoActualizado,
      roles: ['EMPLOYEE'],
      nombreCompleto: empleadoActualizado.nombre,
    };
  }
}
