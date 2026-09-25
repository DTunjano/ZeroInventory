import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoImagenEntityORM } from '../persistence/producto-imagen.orm-entity';
import { ProductoImagenRepository } from '../../domain/repository/producto-imagen.repository';
import { ProductoImagenMapper } from '../mappers/producto-imagen.mapper';
import { ProductoImagen } from '../../domain/entity/producto-imagen.entity';
import { FiltersProductoImagenDTO } from '../../application/dto/filters-producto-imagen-dto';

@Injectable()
export class ProductoImagenRepositoryImpl implements ProductoImagenRepository {
  constructor(
    @InjectRepository(ProductoImagenEntityORM)
    private readonly repo: Repository<ProductoImagenEntityORM>,
  ) {}

  async create(productoImagen: ProductoImagen): Promise<ProductoImagen> {
    const entity = ProductoImagenMapper.toPersistence(productoImagen);
    const saved = await this.repo.save(entity);
    return ProductoImagenMapper.toDomain(saved);
  }

  async update(productoImagen: ProductoImagen): Promise<ProductoImagen> {
    const entity = ProductoImagenMapper.toPersistence(productoImagen);
    const saved = await this.repo.save(entity);
    return ProductoImagenMapper.toDomain(saved);
  }

  async getById(imagenProductoId: number): Promise<ProductoImagen | null> {
    const entity = await this.repo.findOne({
      where: { imagenProductoId: imagenProductoId },
    });
    return entity ? ProductoImagenMapper.toDomain(entity) : null;
  }

  async getAll(filters?: FiltersProductoImagenDTO): Promise<{
    data: ProductoImagen[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repo.createQueryBuilder('productoImagen');

    if (filters?.productoId !== undefined) {
      query.andWhere('productoImagen.productoId = :productoId', {
        productoId: filters.productoId,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    query.skip((page - 1) * limit);
    query.take(limit);
    query.orderBy('productoImagen.createdAt', 'DESC');

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => ProductoImagenMapper.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(imagenProductoId: number): Promise<boolean> {
    const result = await this.repo.delete({
      imagenProductoId: imagenProductoId,
    });
    return (result.affected ?? 0) > 0;
  }

  async deleteByProductoId(productoId: number): Promise<boolean> {
    const result = await this.repo.delete({ productoId: productoId });
    return (result.affected ?? 0) > 0;
  }
}
