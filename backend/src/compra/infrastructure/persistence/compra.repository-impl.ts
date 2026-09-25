import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompraEntityORM } from '../persistence/compra.orm-entity';
import { CompraRepository } from '../../domain/repository/compra.repository';
import { CompraMapper } from '../mappers/compra.mapper';
import { Compra } from '../../domain/entity/compra.entity';
import { FilterCompraDTO } from '../../application/dto/filters-compra-dto';

@Injectable()
export class CompraRepositoryImpl implements CompraRepository {
  constructor(
    @InjectRepository(CompraEntityORM)
    private readonly repo: Repository<CompraEntityORM>,
  ) {}

  async create(compra: Compra): Promise<Compra> {
    const entity = CompraMapper.toPersistence(compra);
    const saved = await this.repo.save(entity);
    return CompraMapper.toDomain(saved);
  }

  async update(compra: Compra): Promise<Compra> {
    const entity = CompraMapper.toPersistence(compra);
    const saved = await this.repo.save(entity);
    return CompraMapper.toDomain(saved);
  }

  async getById(compraId: number): Promise<Compra | null> {
    const entity = await this.repo.findOne({
      where: { compraId: compraId },
    });
    return entity ? CompraMapper.toDomain(entity) : null;
  }

  async getByProveedorId(proveedorId: number): Promise<Compra[]> {
    const entities = await this.repo.find({
      where: { proveedorId: proveedorId },
    });
    return entities.map((entity) => CompraMapper.toDomain(entity));
  }

  async getByUsuarioId(usuarioId: number): Promise<Compra[]> {
    const entities = await this.repo.find({
      where: { usuarioId: usuarioId },
    });
    return entities.map((entity) => CompraMapper.toDomain(entity));
  }

  async getAll(filters?: FilterCompraDTO): Promise<{
    data: Compra[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repo.createQueryBuilder('compra');

    if (filters?.proveedorId !== undefined) {
      query.andWhere('compra.proveedorId = :proveedorId', {
        proveedorId: filters.proveedorId,
      });
    }

    if (filters?.usuarioId !== undefined) {
      query.andWhere('compra.usuarioId = :usuarioId', {
        usuarioId: filters.usuarioId,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    query.skip((page - 1) * limit);
    query.take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => CompraMapper.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(compraId: number): Promise<boolean> {
    const result = await this.repo.delete({ compraId: compraId });
    return (result.affected ?? 0) > 0;
  }
}
