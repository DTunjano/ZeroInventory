import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompraDetalleEntityORM } from '../persistence/compra-detalle.orm-entity';
import { CompraDetalleRepository } from '../../domain/repository/compra-detalle.repository';
import { CompraDetalleMapper } from '../mappers/compra-detalle.mapper';
import { CompraDetalle } from '../../domain/entity/compra-detalle.entity';
import { FilterCompraDetalleDTO } from '../../application/dto/filters-compra-detalle-dto';

@Injectable()
export class CompraDetalleRepositoryImpl implements CompraDetalleRepository {
  constructor(
    @InjectRepository(CompraDetalleEntityORM)
    private readonly repo: Repository<CompraDetalleEntityORM>,
  ) {}

  async create(compraDetalle: CompraDetalle): Promise<CompraDetalle> {
    const entity = CompraDetalleMapper.toPersistence(compraDetalle);
    const saved = await this.repo.save(entity);
    return CompraDetalleMapper.toDomain(saved);
  }

  async update(compraDetalle: CompraDetalle): Promise<CompraDetalle> {
    const entity = CompraDetalleMapper.toPersistence(compraDetalle);
    const saved = await this.repo.save(entity);
    return CompraDetalleMapper.toDomain(saved);
  }

  async getById(compraDetalleId: number): Promise<CompraDetalle | null> {
    const entity = await this.repo.findOne({
      where: { compraDetalleId: compraDetalleId },
    });
    return entity ? CompraDetalleMapper.toDomain(entity) : null;
  }

  async getByCompraId(compraId: number): Promise<CompraDetalle[]> {
    const entities = await this.repo.find({
      where: { compraId: compraId },
    });
    return entities.map((entity) => CompraDetalleMapper.toDomain(entity));
  }

  async getByProductoId(productoId: number): Promise<CompraDetalle[]> {
    const entities = await this.repo.find({
      where: { productoId: productoId },
    });
    return entities.map((entity) => CompraDetalleMapper.toDomain(entity));
  }

  async getAll(filters?: FilterCompraDetalleDTO): Promise<{
    data: CompraDetalle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repo.createQueryBuilder('compraDetalle');

    if (filters?.compraId !== undefined) {
      query.andWhere('compraDetalle.compraId = :compraId', {
        compraId: filters.compraId,
      });
    }

    if (filters?.productoId !== undefined) {
      query.andWhere('compraDetalle.productoId = :productoId', {
        productoId: filters.productoId,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    query.skip((page - 1) * limit);
    query.take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => CompraDetalleMapper.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(compraDetalleId: number): Promise<boolean> {
    const result = await this.repo.delete({ compraDetalleId: compraDetalleId });
    return (result.affected ?? 0) > 0;
  }
}
