import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { lockAccess, preserveAdmin } from '../../../usuario/infrastructure/persistence/access-policy';
import { RolEntityORM } from '../../../rol/infrastructure/persistence/rol.orm-entity';
import { ClienteEntityORM } from '../../../cliente/infrastructure/persistence/cliente.orm-entity';
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity';
import { UsuarioRolRepository } from '../../domain/repository/usuario-rol.repository';
import { UsuarioRol } from '../../domain/entity/usuario-rol.entity';
import { UsuarioRolMapper } from '../mappers/usuario-rol.mapper';
import { UsuarioRolEntityORM } from './usuario-rol.orm-entity';
import { FiltersUsuarioRolDTO } from '../../application/dto/filters-usuario-rol-dto';

@Injectable()
export class UsuarioRolRepositoryImpl implements UsuarioRolRepository {
  constructor(
    @InjectRepository(UsuarioRolEntityORM)
    private readonly repo: Repository<UsuarioRolEntityORM>,
  ) {}

  async create(usuarioRol: UsuarioRol): Promise<UsuarioRol> {
    return this.repo.manager.transaction(async (manager) => {
      await lockAccess(manager);
      await this.validateCustomer(manager, usuarioRol);
      if (await manager.existsBy(UsuarioRolEntityORM, { usuarioId: usuarioRol.usuarioId, rolId: usuarioRol.rolId })) throw new ConflictException('El usuario ya tiene este rol');
      const saved = await manager.save(UsuarioRolEntityORM, UsuarioRolMapper.toPersistence(usuarioRol));
      return UsuarioRolMapper.toDomain(saved);
    });
  }

  private async validateCustomer(manager: EntityManager, assignment: UsuarioRol) {
    const role = await manager.findOneBy(RolEntityORM, { rolId: assignment.rolId });
    if (!role) throw new NotFoundException('Rol no encontrado');
    if (role.nombre === RolNombreEnum.CUSTOMER && !await manager.existsBy(ClienteEntityORM, { usuarioId: assignment.usuarioId })) {
      throw new ConflictException('Crea el perfil de cliente desde la gestión de usuarios antes de asignar CUSTOMER');
    }
  }

  async getById(usuarioRolId: number): Promise<UsuarioRol | null> {
    const entity = await this.repo.findOne({ where: { usuarioRolId } });
    return entity ? UsuarioRolMapper.toDomain(entity) : null;
  }

  async update(usuarioRol: UsuarioRol): Promise<UsuarioRol> {
    return this.repo.manager.transaction(async (manager) => {
      const previousCount = await lockAccess(manager);
      if (!await manager.existsBy(UsuarioRolEntityORM, { usuarioRolId: usuarioRol.usuarioRolId })) throw new NotFoundException('Asignación no encontrada');
      await this.validateCustomer(manager, usuarioRol);
      const duplicate = await manager.findOneBy(UsuarioRolEntityORM, { usuarioId: usuarioRol.usuarioId, rolId: usuarioRol.rolId });
      if (duplicate && duplicate.usuarioRolId !== usuarioRol.usuarioRolId) throw new ConflictException('El usuario ya tiene este rol');
      const updated = await manager.save(UsuarioRolEntityORM, UsuarioRolMapper.toPersistence(usuarioRol));
      await preserveAdmin(manager, previousCount);
      return UsuarioRolMapper.toDomain(updated);
    });
  }

  async delete(usuarioRolId: number): Promise<boolean> {
    return this.repo.manager.transaction(async (manager) => {
      const previousCount = await lockAccess(manager);
      const current = await manager.findOneBy(UsuarioRolEntityORM, { usuarioRolId });
      if (!current) return false;
      if (await manager.countBy(UsuarioRolEntityORM, { usuarioId: current.usuarioId }) <= 1) throw new ConflictException('El usuario debe conservar al menos un rol');
      await manager.delete(UsuarioRolEntityORM, { usuarioRolId });
      await preserveAdmin(manager, previousCount);
      return true;
    });
  }

  async getAll(filters?: FiltersUsuarioRolDTO): Promise<{
    data: UsuarioRol[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const skip = (page - 1) * limit;

    const query = this.repo.createQueryBuilder('usuarioRol');

    if (filters?.usuarioId) {
      query.andWhere('usuarioRol.usuarioId = :usuarioId', {
        usuarioId: filters.usuarioId,
      });
    }

    if (filters?.rolId) {
      query.andWhere('usuarioRol.rolId = :rolId', { rolId: filters.rolId });
    }

    const [entities, total] = await query
      .orderBy('usuarioRol.usuarioRolId', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = entities.map((e) => UsuarioRolMapper.toDomain(e));
    const totalPages = Math.ceil(total / limit);

    return { data, total, page, limit, totalPages };
  }
}
