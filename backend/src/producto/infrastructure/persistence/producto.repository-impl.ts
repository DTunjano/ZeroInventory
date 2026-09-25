import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ProductoEntityORM } from './producto.orm-entity';
import { ProductoRepository } from '../../domain/repository/producto.repository';
import { ProductoMapper } from '../mappers/producto.mapper';
import { Producto } from '../../domain/entity/producto.entity';
import { FiltersProductDTO } from '../../application/dto/filters-product-dto';

@Injectable()
export class ProductoRepositoryImpl implements ProductoRepository {
  constructor(
    @InjectRepository(ProductoEntityORM)
    private readonly repo: Repository<ProductoEntityORM>,
  ) {}

  async create(producto: Producto): Promise<Producto> {
    const entity = ProductoMapper.toPersistence(producto);
    const saved = await this.repo.save(entity);
    return ProductoMapper.toDomain(saved);
  }

  async update(producto: Producto): Promise<Producto> {
    const entity = ProductoMapper.toPersistence(producto);
    const saved = await this.repo.save(entity);
    return ProductoMapper.toDomain(saved);
  }

  async getById(productoId: number): Promise<Producto | null> {
    const entity = await this.repo.findOne({
      where: { productoId: productoId },
    });
    return entity ? ProductoMapper.toDomain(entity) : null;
  }

  async getAll(filters?: FiltersProductDTO): Promise<{
    data: Producto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repo.createQueryBuilder('producto');

    if (filters?.nombre) {
      query.andWhere('producto.nombre ILIKE :nombre', {
        nombre: `%${filters.nombre}%`,
      });
    }

    if (filters?.marca) {
      query.andWhere('producto.marca = :marca', { marca: filters.marca });
    }

    if (filters?.precioMin !== undefined) {
      query.andWhere('producto.precio >= :precioMin', {
        precioMin: filters.precioMin,
      });
    }

    if (filters?.precioMax !== undefined) {
      query.andWhere('producto.precio <= :precioMax', {
        precioMax: filters.precioMax,
      });
    }
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    query.skip((page - 1) * limit);
    query.take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => ProductoMapper.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(productoId: number): Promise<boolean> {
    const result = await this.repo.delete({ productoId: productoId });
    return (result.affected ?? 0) > 0;
  }

  async existsByNombre(
    nombre: string,
    excludeProductoId?: number,
  ): Promise<boolean> {
    return this.repo.exists({
      where: {
        nombre,
        ...(excludeProductoId ? { productoId: Not(excludeProductoId) } : {}),
      },
    });
  }

  async existsBySku(sku: string): Promise<boolean> {
    return this.repo.exists({
      where: { sku },
    });
  }
}
