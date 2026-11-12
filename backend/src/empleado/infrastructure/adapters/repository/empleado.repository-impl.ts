import { Injectable } from '@nestjs/common';
import { UsuarioEntityORM } from '../../../../usuario/infrastructure/persistence/usuario.orm-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Empleado,
  EmpleadoConRoles,
} from '../../../domain/entity/empleado.entity';
import {
  EmpleadoRepositoryPort,
  FiltrosEmpleadoDTO,
  PaginatedEmpleados,
} from '../../../domain/port/out/empleado.repository.port';
import { EmpleadoEntityORM } from '../persistence/empleado.orm-entity';
import { EmpleadoMapper } from '../persistence/empleado.mapper';

@Injectable()
export class EmpleadoRepositoryImpl implements EmpleadoRepositoryPort {
  constructor(
    @InjectRepository(EmpleadoEntityORM)
    private readonly repo: Repository<EmpleadoEntityORM>,
  ) {}

  async crear(empleado: Empleado): Promise<Empleado> {
    const entity = EmpleadoMapper.toPersistence(empleado);
    const saved = await this.repo.save(entity);
    return EmpleadoMapper.toDomain(saved);
  }

  async obtenerPorId(empleadoId: number): Promise<EmpleadoConRoles | null> {
    const entity = await this.repo.findOne({
      where: { empleadoId },
    });
    if (!entity) return null;
    const domain = EmpleadoMapper.toDomain(entity);
    return {
      ...domain,
      roles: ['EMPLOYEE'],
      nombreCompleto: domain.nombre,
    };
  }

  async obtenerPorEmail(email: string): Promise<EmpleadoConRoles | null> {
    const entity = await this.repo.findOne({
      where: { email },
    });
    if (!entity) return null;
    const domain = EmpleadoMapper.toDomain(entity);
    return {
      ...domain,
      roles: ['EMPLOYEE'],
      nombreCompleto: domain.nombre,
    };
  }

  async obtenerPorDocumento(
    documento: string,
  ): Promise<EmpleadoConRoles | null> {
    const entity = await this.repo.findOne({
      where: { documento },
    });
    if (!entity) return null;
    const domain = EmpleadoMapper.toDomain(entity);
    return {
      ...domain,
      roles: ['EMPLOYEE'],
      nombreCompleto: domain.nombre,
    };
  }

  async listar(filtros?: FiltrosEmpleadoDTO): Promise<PaginatedEmpleados> {
    const query = this.repo.createQueryBuilder('empleado');

    if (filtros?.nombre) {
      query.andWhere('empleado.nombre ILIKE :nombre', {
        nombre: `%${filtros.nombre}%`,
      });
    }

    if (filtros?.email) {
      query.andWhere('empleado.email ILIKE :email', {
        email: `%${filtros.email}%`,
      });
    }

    if (filtros?.estado) {
      query.andWhere('empleado.estado = :estado', {
        estado: filtros.estado,
      });
    }

    const page = filtros?.page || 1;
    const limit = filtros?.limit || 10;

    query.skip((page - 1) * limit);
    query.take(limit);
    query.orderBy('empleado.created_at', 'DESC');

    const [entities, total] = await query.getManyAndCount();

    const data: EmpleadoConRoles[] = entities.map((e) => {
      const domain = EmpleadoMapper.toDomain(e);
      return {
        ...domain,
        roles: ['EMPLOYEE'],
        nombreCompleto: domain.nombre,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async actualizar(
    empleadoId: number,
    datos: Partial<Empleado>,
    passwordHash?: string,
  ): Promise<Empleado> {
    return this.repo.manager.transaction(async (manager) => {
      const employee = await manager.findOneOrFail(EmpleadoEntityORM, { where: { empleadoId }, lock: { mode: 'pessimistic_write' } });
      await manager.update(EmpleadoEntityORM, empleadoId, datos as Partial<EmpleadoEntityORM>);
      if (passwordHash && employee.usuarioId != null) {
        await manager.update(UsuarioEntityORM, employee.usuarioId, { password: passwordHash });
      }
      const updated = await manager.findOneOrFail(EmpleadoEntityORM, { where: { empleadoId } });
      return EmpleadoMapper.toDomain(updated);
    });
  }

  async cambiarEstado(
    empleadoId: number,
    estado: string,
  ): Promise<Empleado> {
    const empleado = await this.repo.findOneOrFail({
      where: { empleadoId },
    });
    empleado.estado = estado;
    const saved = await this.repo.save(empleado);
    return EmpleadoMapper.toDomain(saved);
  }
}
