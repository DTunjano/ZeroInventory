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

  async getByIds(productoIds: number[]): Promise<Producto[]> {
    if (productoIds.length === 0) {
      return [];
    }

    const entities = await this.repo
      .createQueryBuilder('producto')
      .where('producto.productoId IN (:...productoIds)', { productoIds })
      .getMany();

    return entities.map((entity) => ProductoMapper.toDomain(entity));
  }

  async getAll(filters?: FiltersProductDTO): Promise<{
    data: Producto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repo.createQueryBuilder('producto');

    if (filters?.isActive !== undefined) {
      query.andWhere('producto.is_active = :isActive', {
        isActive: filters.isActive,
      });
    }

    // General search that applies to nombre and sku
    if (filters?.search) {
      query.andWhere('(producto.nombre ILIKE :search OR producto.sku ILIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    // Specific nombre filter (keeps backward compatibility)
    if (filters?.nombre) {
      query.andWhere('producto.nombre ILIKE :nombre', {
        nombre: `%${filters.nombre}%`,
      });
    }

    // SKU filter
    if (filters?.sku) {
      query.andWhere('producto.sku ILIKE :sku', { sku: `%${filters.sku}%` });
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

    // Filter by category using a safe EXISTS subquery to avoid duplicate rows
    if (filters?.categoriaId) {
      query.andWhere(
        'EXISTS (SELECT 1 FROM categoria_producto cp WHERE cp.producto_id = producto.producto_id AND cp.categoria_id = :categoriaId)',
        { categoriaId: filters.categoriaId },
      );
    }

    // Support filtering by multiple category ids
    if (filters?.categoriaIds && Array.isArray(filters.categoriaIds) && filters.categoriaIds.length) {
      query.andWhere(
        'EXISTS (SELECT 1 FROM categoria_producto cp WHERE cp.producto_id = producto.producto_id AND cp.categoria_id IN (:...categoriaIds))',
        { categoriaIds: filters.categoriaIds },
      );
    }

    // Sorting
    const order: 'ASC' | 'DESC' = (filters?.order ?? 'desc').toUpperCase() as 'ASC' | 'DESC';
    if (filters?.sortBy === 'stock') {
      query.orderBy('producto.cantidad', order);
    } else if (filters?.sortBy === 'categoria') {
      // Order by first category name (subquery)
      query.addOrderBy(
        `(SELECT c.nombre FROM categoria_producto cp JOIN categoria c ON cp.categoria_id = c.categoria_id WHERE cp.producto_id = producto.producto_id LIMIT 1)`,
        order,
      );
    } else if (filters?.sortBy === 'nombre') {
      query.orderBy('producto.nombre', order);
    } else {
      // Default ordering
      query.orderBy('producto.created_at', 'DESC');
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

  async existsBySku(sku: string, excludeProductoId?: number): Promise<boolean> {
    return this.repo.exists({
      where: {
        sku,
        ...(excludeProductoId ? { productoId: Not(excludeProductoId) } : {}),
      },
    });
  }
}
