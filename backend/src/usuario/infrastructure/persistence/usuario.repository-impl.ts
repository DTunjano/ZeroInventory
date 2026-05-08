import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(usuario: Usuario): Promise<Usuario> {
    const entity = UsuarioMapper.toPersistence(usuario);
    const saved = await this.repo.save(entity);
    return UsuarioMapper.toDomain(saved);
  }

  async update(usuario: Usuario): Promise<Usuario> {
    const entity = UsuarioMapper.toPersistence(usuario);
    const saved = await this.repo.save(entity);
    return UsuarioMapper.toDomain(saved);
  }

  async getById(usuarioId: number): Promise<Usuario | null> {
    const entity = await this.repo.findOne({
      where: { usuarioId: usuarioId },
    });
    return entity ? UsuarioMapper.toDomain(entity) : null;
  }

  async getByUsername(username: string): Promise<Usuario | null> {
    const entity = await this.repo.findOne({
      where: { username: username },
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
    const query = this.repo.createQueryBuilder('usuario');

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
    const result = await this.repo.delete({ usuarioId: usuarioId });
    return (result.affected ?? 0) > 0;
  }
}
