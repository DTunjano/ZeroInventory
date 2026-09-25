import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarritoEntityORM } from '../persistence/carrito.orm-entity';
import { CarritoRepository } from '../../domain/repository/carrito.repository';
import { CarritoMapper } from '../mappers/carrito.mapper';
import { Carrito, EstadoCarritoEnum } from '../../domain/entity/carrito.entity';
import { FiltersCarritoDTO } from '../../application/dto/filters-carrito-dto';

@Injectable()
export class CarritoRepositoryImpl implements CarritoRepository {
  constructor(
    @InjectRepository(CarritoEntityORM)
    private readonly repo: Repository<CarritoEntityORM>,
  ) {}

  async create(carrito: Carrito): Promise<Carrito> {
    const entity = CarritoMapper.toPersistence(carrito);
    const saved = await this.repo.save(entity);
    return CarritoMapper.toDomain(saved);
  }

  async update(carrito: Carrito): Promise<Carrito> {
    const entity = CarritoMapper.toPersistence(carrito);
    const saved = await this.repo.save(entity);
    return CarritoMapper.toDomain(saved);
  }

  async getById(carritoId: number): Promise<Carrito | null> {
    const entity = await this.repo.findOne({
      where: { carritoId: carritoId },
    });
    return entity ? CarritoMapper.toDomain(entity) : null;
  }

  async getOpenCartByUsuarioId(usuarioId: number): Promise<Carrito | null> {
    const entity = await this.repo.findOne({
      where: {
        usuarioId: usuarioId,
        estado: EstadoCarritoEnum.ABIERTO,
      },
    });
    return entity ? CarritoMapper.toDomain(entity) : null;
  }

  async getAll(filters?: FiltersCarritoDTO): Promise<{
    data: Carrito[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repo.createQueryBuilder('carrito');

    if (filters?.usuarioId !== undefined) {
      query.andWhere('carrito.usuarioId = :usuarioId', {
        usuarioId: filters.usuarioId,
      });
    }

    if (filters?.estado) {
      query.andWhere('carrito.estado = :estado', {
        estado: filters.estado,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    query.skip((page - 1) * limit);
    query.take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => CarritoMapper.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(carritoId: number): Promise<boolean> {
    const result = await this.repo.delete({ carritoId: carritoId });
    return (result.affected ?? 0) > 0;
  }
}
