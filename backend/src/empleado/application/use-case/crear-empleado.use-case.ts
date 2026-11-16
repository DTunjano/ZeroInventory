import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Empleado, EmpleadoEstadoEnum, EmpleadoConRoles } from '../../domain/entity/empleado.entity';
import { EmpleadoRepositoryPort } from '../../domain/port/out/empleado.repository.port';
import { CrearEmpleadoDTO } from '../dto/crear-empleado.dto';

@Injectable()
export class CrearEmpleadoUseCase {
  constructor(private readonly empleadoRepo: EmpleadoRepositoryPort) {}

  async ejecutar(dto: CrearEmpleadoDTO): Promise<EmpleadoConRoles> {
    if (await this.empleadoRepo.obtenerPorEmail(dto.email)) throw new ConflictException('Ya existe un empleado con ese email');
    if (dto.documento && await this.empleadoRepo.obtenerPorDocumento(dto.documento)) throw new ConflictException('Ya existe un empleado con ese documento');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const empleado = new Empleado(null, dto.nombre, dto.email, EmpleadoEstadoEnum.ACTIVO,
      null, dto.telefono ?? null, dto.documento ?? null, new Date(), new Date());
    const saved = await this.empleadoRepo.crear(empleado, passwordHash);
    return { ...saved, roles: ['EMPLOYEE'], nombreCompleto: saved.nombre };
  }
}
