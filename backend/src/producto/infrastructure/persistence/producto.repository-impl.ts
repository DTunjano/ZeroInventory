import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository } from 'typeorm';
import { CategoriaEntityORM } from '../../../categoria/infrastructure/persistence/categoria.orm-entity';
import { CategoriaProductoEntityORM } from '../../../categoria-producto/infrastructure/persistence/categoria-producto.orm-entity';
import { ProductoEntityORM } from './producto.orm-entity';
import { ProductoRepository } from '../../domain/repository/producto.repository';
import { ProductoMapper } from '../mappers/producto.mapper';
import { Producto } from '../../domain/entity/producto.entity';
import { FiltersProductDTO } from '../../application/dto/filters-product-dto';
import { KardexEntityORM, TipoMovimientoEnum, TipoReferenciaEnum } from '../../../kardex/infrastructure/persistence/kardex.orm-entity';
import { recordStockAdjustment, validateStock } from '../../../inventory/infrastructure/stock-transaction';
import { SkuGeneratorService } from '../../domain/services/sku-generator.service';

@Injectable()
export class ProductoRepositoryImpl implements ProductoRepository {
  constructor(
    @InjectRepository(ProductoEntityORM)
    private readonly repo: Repository<ProductoEntityORM>,
  ) {}

  private async setCategories(manager: EntityManager, productoId: number, ids: number[]) {
    const uniqueIds = [...new Set(ids)];
    if (!uniqueIds.length || await manager.countBy(CategoriaEntityORM, { categoriaId: In(uniqueIds) }) !== uniqueIds.length) {
      throw new BadRequestException('Selecciona al menos una categoría válida');
    }
    await manager.delete(CategoriaProductoEntityORM, { productoId });
    await manager.insert(CategoriaProductoEntityORM, uniqueIds.map((categoriaId) => ({
      productoId, categoriaId, createdAt: new Date(), updatedAt: new Date(),
    })));
  }

  async create(producto: Producto, categoriaIds: number[]): Promise<Producto> {
    validateStock(producto.cantidad);
    return this.repo.manager.transaction(async (manager) => {
      const saved = await manager.save(ProductoEntityORM, ProductoMapper.toPersistence(producto));
      saved.sku = SkuGeneratorService.generate(saved.nombre, saved.productoId);
      await manager.save(ProductoEntityORM, saved);
      await this.setCategories(manager, saved.productoId, categoriaIds);
      if (saved.cantidad > 0) {
        await manager.insert(KardexEntityORM, {
          productoId: saved.productoId, tipoMovimiento: TipoMovimientoEnum.ENTRADA,
          cantidad: saved.cantidad, costoUnitario: saved.precio,
          valorTotal: saved.cantidad * saved.precio, referenciaId: saved.productoId,
          tipoReferencia: TipoReferenciaEnum.AJUSTE,
        });
      }
      return ProductoMapper.toDomain(saved);
    });
  }

  async update(producto: Producto, stockChange?: { usuarioId: number; expectedStock: number; changeStock: boolean }, categoriaIds?: number[]): Promise<Producto> {
    return this.repo.manager.transaction(async (manager) => {
      const current = await manager.findOne(ProductoEntityORM, {
        where: { productoId: producto.productoId }, lock: { mode: 'pessimistic_write' },
      });
      if (!current) throw new NotFoundException('Producto no encontrado');
      if (stockChange?.changeStock && producto.cantidad !== current.cantidad) {
        await recordStockAdjustment(manager, current, stockChange.usuarioId, producto.cantidad,
          stockChange.expectedStock, 'Ajuste manual de inventario desde gestión de productos');
      } else if (stockChange?.changeStock && current.cantidad !== stockChange.expectedStock) {
        // A concurrent operation already changed this stock, even if it happens to equal the desired value.
        throw new ConflictException('El stock cambió. Actualiza el producto.');
      }
      const entity = ProductoMapper.toPersistence(producto);
      entity.cantidad = current.cantidad;
      const saved = await manager.save(ProductoEntityORM, entity);
      if (categoriaIds !== undefined) await this.setCategories(manager, saved.productoId, categoriaIds);
      return ProductoMapper.toDomain(saved);
    });
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
    const result = await this.repo.update({ productoId }, { isActive: false, updatedAt: new Date() });
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
