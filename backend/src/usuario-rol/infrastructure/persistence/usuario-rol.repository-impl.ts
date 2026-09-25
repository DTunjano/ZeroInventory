import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const entity = UsuarioRolMapper.toPersistence(usuarioRol);
    const saved = await this.repo.save(entity);
    return UsuarioRolMapper.toDomain(saved);
  }

  async getById(usuarioRolId: number): Promise<UsuarioRol | null> {
    const entity = await this.repo.findOne({ where: { usuarioRolId } });
    return entity ? UsuarioRolMapper.toDomain(entity) : null;
  }

  async update(usuarioRol: UsuarioRol): Promise<UsuarioRol> {
    const entity = UsuarioRolMapper.toPersistence(usuarioRol);
    const updated = await this.repo.save(entity);
    return UsuarioRolMapper.toDomain(updated);
  }

  async delete(usuarioRolId: number): Promise<boolean> {
    const result = await this.repo.delete(usuarioRolId);
    return (result.affected ?? 0) > 0;
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
