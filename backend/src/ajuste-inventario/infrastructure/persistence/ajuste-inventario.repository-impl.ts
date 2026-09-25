import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AjusteInventarioEntityORM } from '../persistence/ajuste-inventario.orm-entity';
import { AjusteInventarioRepository } from '../../domain/repository/ajuste-inventario.repository';
import { AjusteInventarioMapper } from '../mappers/ajuste-inventario.mapper';
import { AjusteInventario } from '../../domain/entity/ajuste-inventario.entity';
import { FilterAjusteInventarioDTO } from '../../application/dto/filters-ajuste-inventario-dto';

@Injectable()
export class AjusteInventarioRepositoryImpl implements AjusteInventarioRepository {
  constructor(
    @InjectRepository(AjusteInventarioEntityORM)
    private readonly repo: Repository<AjusteInventarioEntityORM>,
  ) {}

  async create(ajusteInventario: AjusteInventario): Promise<AjusteInventario> {
    const entity = AjusteInventarioMapper.toPersistence(ajusteInventario);
    const saved = await this.repo.save(entity);
    return AjusteInventarioMapper.toDomain(saved);
  }

  async update(ajusteInventario: AjusteInventario): Promise<AjusteInventario> {
    const entity = AjusteInventarioMapper.toPersistence(ajusteInventario);
    const saved = await this.repo.save(entity);
    return AjusteInventarioMapper.toDomain(saved);
  }

  async getById(ajusteInventarioId: number): Promise<AjusteInventario | null> {
    const entity = await this.repo.findOne({
      where: { ajusteInventarioId: ajusteInventarioId },
    });
    return entity ? AjusteInventarioMapper.toDomain(entity) : null;
  }

  async getByProductoId(productoId: number): Promise<AjusteInventario[]> {
    const entities = await this.repo.find({
      where: { productoId: productoId },
    });
    return entities.map((entity) => AjusteInventarioMapper.toDomain(entity));
  }

  async getByUsuarioId(usuarioId: number): Promise<AjusteInventario[]> {
    const entities = await this.repo.find({
      where: { usuarioId: usuarioId },
    });
    return entities.map((entity) => AjusteInventarioMapper.toDomain(entity));
  }

  async getAll(filters?: FilterAjusteInventarioDTO): Promise<{
    data: AjusteInventario[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repo.createQueryBuilder('ajuste');

    if (filters?.productoId !== undefined) {
      query.andWhere('ajuste.productoId = :productoId', {
        productoId: filters.productoId,
      });
    }

    if (filters?.usuarioId !== undefined) {
      query.andWhere('ajuste.usuarioId = :usuarioId', {
        usuarioId: filters.usuarioId,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    query.skip((page - 1) * limit);
    query.take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => AjusteInventarioMapper.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(ajusteInventarioId: number): Promise<boolean> {
    const result = await this.repo.delete({
      ajusteInventarioId: ajusteInventarioId,
    });
    return (result.affected ?? 0) > 0;
  }
}
