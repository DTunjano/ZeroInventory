import { Injectable, NotFoundException } from '@nestjs/common';
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
import { lockAccess, preserveAdmin } from '../../../../usuario/infrastructure/persistence/access-policy';
import { RolEntityORM } from '../../../../rol/infrastructure/persistence/rol.orm-entity';
import { RolNombreEnum } from '../../../../rol/domain/entity/rol.entity';
import { UsuarioRolEntityORM } from '../../../../usuario-rol/infrastructure/persistence/usuario-rol.orm-entity';

@Injectable()
export class EmpleadoRepositoryImpl implements EmpleadoRepositoryPort {
  constructor(
    @InjectRepository(EmpleadoEntityORM)
    private readonly repo: Repository<EmpleadoEntityORM>,
  ) {}

  async crear(empleado: Empleado, passwordHash?: string): Promise<Empleado> {
    return this.repo.manager.transaction(async (manager) => {
      await lockAccess(manager);
      const saved = await manager.save(EmpleadoEntityORM, EmpleadoMapper.toPersistence(empleado));
      if (passwordHash) {
        const role = await manager.findOneBy(RolEntityORM, { nombre: RolNombreEnum.EMPLOYEE });
        if (!role) throw new NotFoundException('Rol EMPLOYEE no encontrado');
        const user = await manager.save(UsuarioEntityORM, manager.create(UsuarioEntityORM, {
          username: empleado.email, email: empleado.email, password: passwordHash,
          telefono: empleado.telefono, primerNombre: empleado.nombre, isActive: true,
        }));
        await manager.insert(UsuarioRolEntityORM, { usuarioId: user.usuarioId, rolId: role.rolId });
        saved.usuarioId = user.usuarioId;
        await manager.save(EmpleadoEntityORM, saved);
      }
      return EmpleadoMapper.toDomain(saved);
    });
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
    return this.repo.manager.transaction(async (manager) => {
      const previousCount = await lockAccess(manager);
      const empleado = await manager.findOneOrFail(EmpleadoEntityORM, {
        where: { empleadoId }, lock: { mode: 'pessimistic_write' },
      });
      empleado.estado = estado;
      const saved = await manager.save(EmpleadoEntityORM, empleado);
      if (empleado.usuarioId != null) {
        await manager.update(UsuarioEntityORM, empleado.usuarioId, { isActive: estado === 'ACTIVO' });
      }
      await preserveAdmin(manager, previousCount);
      return EmpleadoMapper.toDomain(saved);
    });
  }
}
