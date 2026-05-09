import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaEntityORM } from './categoria.orm-entity';
import { CategoriaRepository } from '../../domain/repository/categoria.repository';
import { CategoriaMapper } from '../mappers/categoria.mapper';
import { Categoria } from '../../domain/entity/categoria.entity';
import { FiltersCategoriaDTO } from '../../application/dto/filters-categoria-dto';

@Injectable()
export class CategoriaRepositoryImpl implements CategoriaRepository {
  constructor(
    @InjectRepository(CategoriaEntityORM)
    private readonly repo: Repository<CategoriaEntityORM>,
  ) {}

  async create(categoria: Categoria): Promise<Categoria> {
    const entity = CategoriaMapper.toPersistence(categoria);
    const saved = await this.repo.save(entity);
    return CategoriaMapper.toDomain(saved);
  }

  async update(categoria: Categoria): Promise<Categoria> {
    const entity = CategoriaMapper.toPersistence(categoria);
    const saved = await this.repo.save(entity);
    return CategoriaMapper.toDomain(saved);
  }

  async getById(categoriaId: number): Promise<Categoria | null> {
    const entity = await this.repo.findOne({
      where: { categoriaId: categoriaId },
    });
    return entity ? CategoriaMapper.toDomain(entity) : null;
  }

  async getAll(filters?: FiltersCategoriaDTO): Promise<{
    data: Categoria[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repo.createQueryBuilder('categoria');

    if (filters?.nombre) {
      query.andWhere('categoria.nombre ILIKE :nombre', {
        nombre: `%${filters.nombre}%`,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    query.skip((page - 1) * limit);
    query.take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => CategoriaMapper.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(categoriaId: number): Promise<boolean> {
    const result = await this.repo.delete({ categoriaId: categoriaId });
    return (result.affected ?? 0) > 0;
  }
}
