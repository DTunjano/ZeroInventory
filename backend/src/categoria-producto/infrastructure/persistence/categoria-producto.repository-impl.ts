import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaProductoEntityORM } from './categoria-producto.orm-entity';
import { CategoriaProductoRepository } from '../../domain/repository/categoria-producto.repository';
import { CategoriaProductoMapper } from '../mappers/categoria-producto.mapper';
import { CategoriaProducto } from '../../domain/entity/categoria-producto.entity';
import { FiltersCategoriaProductoDTO } from '../../application/dto/filters-categoria-producto-dto';

@Injectable()
export class CategoriaProductoRepositoryImpl implements CategoriaProductoRepository {
  constructor(
    @InjectRepository(CategoriaProductoEntityORM)
    private readonly repo: Repository<CategoriaProductoEntityORM>,
  ) {}

  async create(
    categoriaProducto: CategoriaProducto,
  ): Promise<CategoriaProducto> {
    const entity = CategoriaProductoMapper.toPersistence(categoriaProducto);
    const saved = await this.repo.save(entity);
    return CategoriaProductoMapper.toDomain(saved);
  }

  async update(
    categoriaProducto: CategoriaProducto,
  ): Promise<CategoriaProducto> {
    const entity = CategoriaProductoMapper.toPersistence(categoriaProducto);
    const saved = await this.repo.save(entity);
    return CategoriaProductoMapper.toDomain(saved);
  }

  async getById(
    categoriaProductoId: number,
  ): Promise<CategoriaProducto | null> {
    const entity = await this.repo.findOne({
      where: { categoriaProductoId: categoriaProductoId },
    });
    return entity ? CategoriaProductoMapper.toDomain(entity) : null;
  }

  async getAll(filters?: FiltersCategoriaProductoDTO): Promise<{
    data: CategoriaProducto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repo.createQueryBuilder('categoriaProducto');

    if (filters?.categoriaId) {
      query.andWhere('categoriaProducto.categoriaId = :categoriaId', {
        categoriaId: filters.categoriaId,
      });
    }

    if (filters?.productoId) {
      query.andWhere('categoriaProducto.productoId = :productoId', {
        productoId: filters.productoId,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    query.skip((page - 1) * limit);
    query.take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => CategoriaProductoMapper.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(categoriaProductoId: number): Promise<boolean> {
    const result = await this.repo.delete({
      categoriaProductoId: categoriaProductoId,
    });
    return (result.affected ?? 0) > 0;
  }
}
