import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DireccionEntityORM } from './direccion.orm-entity';
import { PedidoEntityORM } from '../../../pedido/infrastructure/persistence/pedido.orm-entity';
import { DireccionRepository } from '../../domain/repository/direccion.repository';
import { DireccionMapper } from '../mappers/direccion.mapper';
import { Direccion } from '../../domain/entity/direccion.entity';
import { FiltersDireccionDTO } from '../../application/dto/filters-direccion-dto';

@Injectable()
export class DireccionRepositoryImpl implements DireccionRepository {
  constructor(
    @InjectRepository(DireccionEntityORM)
    private readonly repo: Repository<DireccionEntityORM>,
    @InjectRepository(PedidoEntityORM)
    private readonly pedidoRepo: Repository<PedidoEntityORM>,
  ) {}

  async create(direccion: Direccion): Promise<Direccion> {
    const entity = DireccionMapper.toPersistence(direccion);
    
    // Si es predeterminada, desmarcar las otras del mismo cliente
    if (entity.esPredeterminada && entity.clienteId) {
      await this.repo.update(
        { clienteId: entity.clienteId, esPredeterminada: true },
        { esPredeterminada: false },
      );
    }
    
    const saved = await this.repo.save(entity);
    return DireccionMapper.toDomain(saved);
  }

  async update(direccion: Direccion): Promise<Direccion> {
    const entity = DireccionMapper.toPersistence(direccion);
    
    // Si es predeterminada, desmarcar las otras del mismo cliente
    if (entity.esPredeterminada && entity.clienteId) {
      await this.repo.update(
        { clienteId: entity.clienteId, esPredeterminada: true },
        { esPredeterminada: false },
      );
    }
    
    const saved = await this.repo.save(entity);
    return DireccionMapper.toDomain(saved);
  }

  async getById(direccionId: number): Promise<Direccion | null> {
    const entity = await this.repo.findOne({
      where: { direccionId: direccionId, estado: true },
    });
    return entity ? DireccionMapper.toDomain(entity) : null;
  }

  async getAll(filters?: FiltersDireccionDTO): Promise<{
    data: Direccion[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repo.createQueryBuilder('direccion');

    query.andWhere('direccion.estado = true');

    if (filters?.clienteId) {
      query.andWhere('direccion.clienteId = :clienteId', {
        clienteId: filters.clienteId,
      });
    }

    if (filters?.barrio) {
      query.andWhere('direccion.barrio ILIKE :barrio', {
        barrio: `%${filters.barrio}%`,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    query.skip((page - 1) * limit);
    query.take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => DireccionMapper.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(direccionId: number): Promise<boolean> {
    const direccion = await this.repo.findOne({
      where: { direccionId },
      select: { direccionId: true, estado: true },
    });

    if (!direccion) {
      return false;
    }

    const pedidosUsandoDireccion = await this.pedidoRepo.count({
      where: { direccionId },
    });

    if (pedidosUsandoDireccion > 0) {
      const result = await this.repo.update(
        { direccionId },
        { estado: false, esPredeterminada: false },
      );
      return (result.affected ?? 0) > 0;
    }

    const result = await this.repo.delete({ direccionId });
    return (result.affected ?? 0) > 0;
  }
}
