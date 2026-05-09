import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoEntityORM } from './pedido.orm-entity';
import { PedidoRepository } from '../../domain/repository/pedido.repository';
import { PedidoMapper } from '../mappers/pedido.mapper';
import { Pedido } from '../../domain/entity/pedido.entity';
import { FiltersPedidoDTO } from '../../application/dto/filters-pedido-dto';

@Injectable()
export class PedidoRepositoryImpl implements PedidoRepository {
  constructor(
    @InjectRepository(PedidoEntityORM)
    private readonly repo: Repository<PedidoEntityORM>,
  ) {}

  async create(pedido: Pedido): Promise<Pedido> {
    const entity = PedidoMapper.toPersistence(pedido);
    const saved = await this.repo.save(entity);
    return PedidoMapper.toDomain(saved);
  }

  async update(pedido: Pedido): Promise<Pedido> {
    const entity = PedidoMapper.toPersistence(pedido);
    const saved = await this.repo.save(entity);
    return PedidoMapper.toDomain(saved);
  }

  async getById(pedidoId: number): Promise<Pedido | null> {
    const entity = await this.repo.findOne({
      where: { pedidoId: pedidoId },
    });
    return entity ? PedidoMapper.toDomain(entity) : null;
  }

  async getAll(filters?: FiltersPedidoDTO): Promise<{
    data: Pedido[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repo.createQueryBuilder('pedido');

    if (filters?.clienteId) {
      query.andWhere('pedido.clienteId = :clienteId', {
        clienteId: filters.clienteId,
      });
    }

    if (filters?.direccionId) {
      query.andWhere('pedido.direccionId = :direccionId', {
        direccionId: filters.direccionId,
      });
    }

    if (filters?.estado) {
      query.andWhere('pedido.estado = :estado', {
        estado: filters.estado,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    query.skip((page - 1) * limit);
    query.take(limit);
    query.orderBy('pedido.fecha', 'DESC');

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => PedidoMapper.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(pedidoId: number): Promise<boolean> {
    const result = await this.repo.delete({ pedidoId: pedidoId });
    return (result.affected ?? 0) > 0;
  }
}
