import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { UsuarioAccess } from '../../domain/entity/usuario-access';
import { RolEntityORM } from '../../../rol/infrastructure/persistence/rol.orm-entity';
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity';
import { UsuarioRolEntityORM } from '../../../usuario-rol/infrastructure/persistence/usuario-rol.orm-entity';
import { ClienteEntityORM } from '../../../cliente/infrastructure/persistence/cliente.orm-entity';
import { TipoDocumentoEnum } from '../../../cliente/domain/entity/cliente.entity';
import { lockAccess, preserveAdmin } from './access-policy';
import { UsuarioEntityORM } from './usuario.orm-entity';
import { UsuarioRepository } from '../../domain/repository/usuario.repository';
import { UsuarioMapper } from '../mappers/usuario.mapper';
import { Usuario } from '../../domain/entity/usuario.entity';
import { FiltersUsuarioDTO } from '../../application/dto/filters-usuario-dto';

@Injectable()
export class UsuarioRepositoryImpl implements UsuarioRepository {
  constructor(
    @InjectRepository(UsuarioEntityORM)
    private readonly repo: Repository<UsuarioEntityORM>,
  ) {}

  private async setAccess(manager: EntityManager, usuarioId: number, access: UsuarioAccess) {
    const names = [...new Set(access.roles)];
    const roles = await manager.findBy(RolEntityORM, { nombre: In(names) });
    if (!names.length || roles.length !== names.length) throw new BadRequestException('Selecciona roles válidos');
    if (names.includes(RolNombreEnum.CUSTOMER) && !await manager.existsBy(ClienteEntityORM, { usuarioId })) {
      if (!access.documento?.trim()) throw new BadRequestException('El documento es obligatorio para crear el perfil de cliente');
      await manager.insert(ClienteEntityORM, { usuarioId, documento: access.documento.trim(), tipoDocumento: access.tipoDocumento ?? TipoDocumentoEnum.CC });
    }
    await manager.delete(UsuarioRolEntityORM, { usuarioId });
    await manager.insert(UsuarioRolEntityORM, roles.map((role) => ({ usuarioId, rolId: role.rolId })));
  }

  async create(usuario: Usuario, access?: UsuarioAccess): Promise<Usuario> {
    return this.repo.manager.transaction(async (manager) => {
      await lockAccess(manager);
      const saved = await manager.save(UsuarioEntityORM, UsuarioMapper.toPersistence(usuario));
      if (access) await this.setAccess(manager, saved.usuarioId, access);
      const result = await manager.findOneOrFail(UsuarioEntityORM, { where: { usuarioId: saved.usuarioId }, relations: { usuarioRoles: { rol: true } } });
      return UsuarioMapper.toDomain(result);
    });
  }

  async update(usuario: Usuario, access?: UsuarioAccess): Promise<Usuario> {
    return this.repo.manager.transaction(async (manager) => {
      const previousCount = await lockAccess(manager);
      if (!await manager.existsBy(UsuarioEntityORM, { usuarioId: usuario.usuarioId })) throw new NotFoundException('Usuario no encontrado');
      const saved = await manager.save(UsuarioEntityORM, UsuarioMapper.toPersistence(usuario));
      if (access) await this.setAccess(manager, saved.usuarioId, access);
      await preserveAdmin(manager, previousCount);
      const result = await manager.findOneOrFail(UsuarioEntityORM, { where: { usuarioId: saved.usuarioId }, relations: { usuarioRoles: { rol: true } } });
      return UsuarioMapper.toDomain(result);
    });
  }

  async getById(usuarioId: number): Promise<Usuario | null> {
    const entity = await this.repo.findOne({
      where: { usuarioId: usuarioId },
      relations: { usuarioRoles: { rol: true } },
    });
    return entity ? UsuarioMapper.toDomain(entity) : null;
  }

  async getByUsername(username: string): Promise<Usuario | null> {
    const entity = await this.repo.findOne({
      where: { username: username },
    });
    return entity ? UsuarioMapper.toDomain(entity) : null;
  }

  async getByEmail(email: string): Promise<Usuario | null> {
    const entity = await this.repo.findOne({
      where: { email: email },
    });
    return entity ? UsuarioMapper.toDomain(entity) : null;
  }

  async getAll(filters?: FiltersUsuarioDTO): Promise<{
    data: Usuario[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repo.createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.usuarioRoles', 'assignment')
      .leftJoinAndSelect('assignment.rol', 'role')
      .orderBy('usuario.usuarioId', 'ASC');

    if (filters?.username) {
      query.andWhere('usuario.username ILIKE :username', {
        username: `%${filters.username}%`,
      });
    }

    if (filters?.primerNombre) {
      query.andWhere('usuario.primerNombre ILIKE :primerNombre', {
        primerNombre: `%${filters.primerNombre}%`,
      });
    }

    if (filters?.primerApellido) {
      query.andWhere('usuario.primerApellido ILIKE :primerApellido', {
        primerApellido: `%${filters.primerApellido}%`,
      });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('usuario.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    query.skip((page - 1) * limit);
    query.take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => UsuarioMapper.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(usuarioId: number): Promise<boolean> {
    return this.repo.manager.transaction(async (manager) => {
      const previousCount = await lockAccess(manager);
      const result = await manager.update(UsuarioEntityORM, { usuarioId }, { isActive: false });
      await preserveAdmin(manager, previousCount);
      return (result.affected ?? 0) > 0;
    });
  }
}
