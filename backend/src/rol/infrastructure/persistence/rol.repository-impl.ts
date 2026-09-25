import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolRepository } from '../../domain/repository/rol.repository';
import { Rol } from '../../domain/entity/rol.entity';
import { RolMapper } from '../mappers/rol.mapper';
import { RolEntityORM } from './rol.orm-entity';
import { FiltersRolDTO } from '../../application/dto/filters-rol-dto';

@Injectable()
export class RolRepositoryImpl implements RolRepository {
  constructor(
    @InjectRepository(RolEntityORM)
    private readonly repo: Repository<RolEntityORM>,
  ) {}

  async create(rol: Rol): Promise<Rol> {
    const entity = RolMapper.toPersistence(rol);
    const saved = await this.repo.save(entity);
    return RolMapper.toDomain(saved);
  }

  async getById(rolId: number): Promise<Rol | null> {
    const entity = await this.repo.findOne({ where: { rolId } });
    return entity ? RolMapper.toDomain(entity) : null;
  }

  async update(rol: Rol): Promise<Rol> {
    const entity = RolMapper.toPersistence(rol);
    const updated = await this.repo.save(entity);
    return RolMapper.toDomain(updated);
  }

  async delete(rolId: number): Promise<boolean> {
    const result = await this.repo.delete(rolId);
    return (result.affected ?? 0) > 0;
  }

  async getAll(filters?: FiltersRolDTO): Promise<{
    data: Rol[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const skip = (page - 1) * limit;

    const query = this.repo.createQueryBuilder('rol');

    if (filters?.nombre) {
      query.andWhere('rol.nombre = :nombre', { nombre: filters.nombre });
    }

    const [entities, total] = await query
      .orderBy('rol.rolId', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = entities.map((e) => RolMapper.toDomain(e));
    const totalPages = Math.ceil(total / limit);

    return { data, total, page, limit, totalPages };
  }
}
