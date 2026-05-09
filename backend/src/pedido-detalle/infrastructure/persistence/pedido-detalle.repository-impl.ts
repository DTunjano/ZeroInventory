import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoDetalleRepository } from '../../domain/repository/pedido-detalle.repository';
import { PedidoDetalle } from '../../domain/entity/pedido-detalle.entity';
import { PedidoDetalleMapper } from '../mappers/pedido-detalle.mapper';
import { PedidoDetalleEntityORM } from './pedido-detalle.orm-entity';
import { FiltersPedidoDetalleDTO } from '../../application/dto/filters-pedido-detalle-dto';

@Injectable()
export class PedidoDetalleRepositoryImpl implements PedidoDetalleRepository {
  constructor(
    @InjectRepository(PedidoDetalleEntityORM)
    private readonly repo: Repository<PedidoDetalleEntityORM>,
  ) {}

  async create(pedidoDetalle: PedidoDetalle): Promise<PedidoDetalle> {
    const entity = PedidoDetalleMapper.toPersistence(pedidoDetalle);
    const saved = await this.repo.save(entity);
    return PedidoDetalleMapper.toDomain(saved);
  }

  async getById(pedidoDetalleId: number): Promise<PedidoDetalle | null> {
    const entity = await this.repo.findOne({ where: { pedidoDetalleId } });
    return entity ? PedidoDetalleMapper.toDomain(entity) : null;
  }

  async update(pedidoDetalle: PedidoDetalle): Promise<PedidoDetalle> {
    const entity = PedidoDetalleMapper.toPersistence(pedidoDetalle);
    const updated = await this.repo.save(entity);
    return PedidoDetalleMapper.toDomain(updated);
  }

  async delete(pedidoDetalleId: number): Promise<boolean> {
    const result = await this.repo.delete(pedidoDetalleId);
    return (result.affected ?? 0) > 0;
  }

  async getAll(filters?: FiltersPedidoDetalleDTO): Promise<{
    data: PedidoDetalle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const skip = (page - 1) * limit;

    const query = this.repo.createQueryBuilder('pedidoDetalle');

    if (filters?.pedidoId) {
      query.andWhere('pedidoDetalle.pedidoId = :pedidoId', {
        pedidoId: filters.pedidoId,
      });
    }

    if (filters?.productoId) {
      query.andWhere('pedidoDetalle.productoId = :productoId', {
        productoId: filters.productoId,
      });
    }

    const [entities, total] = await query
      .orderBy('pedidoDetalle.pedidoDetalleId', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = entities.map((e) => PedidoDetalleMapper.toDomain(e));
    const totalPages = Math.ceil(total / limit);

    return { data, total, page, limit, totalPages };
  }
}
