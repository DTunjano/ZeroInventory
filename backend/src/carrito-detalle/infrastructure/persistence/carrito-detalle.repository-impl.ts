import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarritoDetalleEntityORM } from '../persistence/carrito-detalle.orm-entity';
import { CarritoDetalleRepository } from '../../domain/repository/carrito-detalle.repository';
import { CarritoDetalleMapper } from '../mappers/carrito-detalle.mapper';
import { CarritoDetalle } from '../../domain/entity/carrito-detalle.entity';
import { FiltersCarritoDetalleDTO } from '../../application/dto/filters-carrito-detalle-dto';

@Injectable()
export class CarritoDetalleRepositoryImpl implements CarritoDetalleRepository {
  constructor(
    @InjectRepository(CarritoDetalleEntityORM)
    private readonly repo: Repository<CarritoDetalleEntityORM>,
  ) {}

  async create(carritoDetalle: CarritoDetalle): Promise<CarritoDetalle> {
    const entity = CarritoDetalleMapper.toPersistence(carritoDetalle);
    const saved = await this.repo.save(entity);
    return CarritoDetalleMapper.toDomain(saved);
  }

  async update(carritoDetalle: CarritoDetalle): Promise<CarritoDetalle> {
    const entity = CarritoDetalleMapper.toPersistence(carritoDetalle);
    const saved = await this.repo.save(entity);
    return CarritoDetalleMapper.toDomain(saved);
  }

  async getById(carritoDetalleId: number): Promise<CarritoDetalle | null> {
    const entity = await this.repo.findOne({
      where: { carritoDetalleId: carritoDetalleId },
    });
    return entity ? CarritoDetalleMapper.toDomain(entity) : null;
  }

  async getByCarritoId(carritoId: number): Promise<CarritoDetalle[] | null> {
    const entities = await this.repo.find({
      where: { carritoId: carritoId },
    });
    return entities
      ? entities.map((e) => CarritoDetalleMapper.toDomain(e))
      : null;
  }

  async getByCarritoIdAndProductoId(
    carritoId: number,
    productoId: number,
  ): Promise<CarritoDetalle | null> {
    const entity = await this.repo.findOne({
      where: { carritoId: carritoId, productoId: productoId },
    });
    return entity ? CarritoDetalleMapper.toDomain(entity) : null;
  }

  async getAll(filters?: FiltersCarritoDetalleDTO): Promise<{
    data: CarritoDetalle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repo.createQueryBuilder('carritoDetalle');

    if (filters?.carritoId !== undefined) {
      query.andWhere('carritoDetalle.carritoId = :carritoId', {
        carritoId: filters.carritoId,
      });
    }

    if (filters?.productoId !== undefined) {
      query.andWhere('carritoDetalle.productoId = :productoId', {
        productoId: filters.productoId,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    query.skip((page - 1) * limit);
    query.take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => CarritoDetalleMapper.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(carritoDetalleId: number): Promise<boolean> {
    const result = await this.repo.delete({
      carritoDetalleId: carritoDetalleId,
    });
    return (result.affected ?? 0) > 0;
  }
}
