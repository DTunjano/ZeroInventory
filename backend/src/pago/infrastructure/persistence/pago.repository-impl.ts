import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PagoRepository } from '../../domain/repository/pago.repository';
import { Pago } from '../../domain/entity/pago.entity';
import { PagoMapper } from '../mappers/pago.mapper';
import { PagoEntityORM } from './pago.orm-entity';
import { FiltersPagoDTO } from '../../application/dto/filters-pago-dto';

@Injectable()
export class PagoRepositoryImpl implements PagoRepository {
  constructor(
    @InjectRepository(PagoEntityORM)
    private readonly repo: Repository<PagoEntityORM>,
  ) {}

  async create(pago: Pago): Promise<Pago> {
    const entity = PagoMapper.toPersistence(pago);
    const saved = await this.repo.save(entity);
    return PagoMapper.toDomain(saved);
  }

  async getById(pagoId: number): Promise<Pago | null> {
    const entity = await this.repo.findOne({ where: { pagoId } });
    return entity ? PagoMapper.toDomain(entity) : null;
  }

  async update(pago: Pago): Promise<Pago> {
    const entity = PagoMapper.toPersistence(pago);
    const updated = await this.repo.save(entity);
    return PagoMapper.toDomain(updated);
  }

  async delete(pagoId: number): Promise<boolean> {
    const result = await this.repo.delete(pagoId);
    return (result.affected ?? 0) > 0;
  }

  async getAll(filters?: FiltersPagoDTO): Promise<{
    data: Pago[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const skip = (page - 1) * limit;

    const query = this.repo.createQueryBuilder('pago');

    if (filters?.pedidoId) {
      query.andWhere('pago.pedidoId = :pedidoId', {
        pedidoId: filters.pedidoId,
      });
    }

    if (filters?.metodoPago) {
      query.andWhere('pago.metodoPago = :metodoPago', {
        metodoPago: filters.metodoPago,
      });
    }

    if (filters?.estado) {
      query.andWhere('pago.estado = :estado', { estado: filters.estado });
    }

    const [entities, total] = await query
      .orderBy('pago.fechaPago', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = entities.map((e) => PagoMapper.toDomain(e));
    const totalPages = Math.ceil(total / limit);

    return { data, total, page, limit, totalPages };
  }
}
