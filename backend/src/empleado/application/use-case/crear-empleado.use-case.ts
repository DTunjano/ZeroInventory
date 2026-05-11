import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Empleado, EmpleadoEstadoEnum, EmpleadoConRoles } from '../../domain/entity/empleado.entity';
import { EmpleadoRepositoryPort } from '../../domain/port/out/empleado.repository.port';
import { CrearEmpleadoDTO } from '../dto/crear-empleado.dto';

@Injectable()
export class CrearEmpleadoUseCase {
  constructor(private readonly empleadoRepo: EmpleadoRepositoryPort) {}

  async ejecutar(dto: CrearEmpleadoDTO): Promise<EmpleadoConRoles> {
    try {
      const emailExistente = await this.empleadoRepo.obtenerPorEmail(dto.email);
      if (emailExistente) {
        throw new ConflictException('Ya existe un empleado con ese email');
      }

      if (dto.documento) {
        const documentoExistente = await this.empleadoRepo.obtenerPorDocumento(dto.documento);
        if (documentoExistente) {
          throw new ConflictException('Ya existe un empleado con ese documento');
        }
      }

      const hashPassword = await bcrypt.hash(dto.password, 10);

      const empleado = new Empleado(
        null,
        dto.nombre,
        dto.email,
        EmpleadoEstadoEnum.ACTIVO,
        null,
        dto.documento ?? null,
        dto.telefono ?? null,
        new Date(),
        new Date(),
      );

      const empleadoCreado = await this.empleadoRepo.crear(empleado);
      
      return {
        ...empleadoCreado,
        roles: ['EMPLOYEE'],
        nombreCompleto: dto.nombre,
      } as EmpleadoConRoles;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al crear el empleado: ' + (error as Error).message,
      );
    }
  }
}
