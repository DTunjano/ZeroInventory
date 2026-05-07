import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoORMEntity } from './producto.orm-entity';
import { ProductoRepository } from '../../domain/repository/producto.repository';
import { ProductoMapper } from '../mappers/producto.mapper';
import { Producto } from '../../domain/entity/producto.entity';
import { FiltersProductDTO } from '../../application/dto/filters-product-dto';

@Injectable()
export class ProductoRepositoryImpl implements ProductoRepository {
  constructor(
    @InjectRepository(ProductoORMEntity)
    private readonly repo: Repository<ProductoORMEntity>,
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

  async getAll(filters?: FiltersProductDTO): Promise<Producto[]> {
    const query = this.repo.createQueryBuilder('producto');
    console.log(filters?.precioMin);
    console.log(typeof filters?.precioMin);

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

    const entities = await query.getMany();
    return entities.map((entity) => ProductoMapper.toDomain(entity));
  }

  async delete(productoId: number): Promise<boolean> {
    const result = await this.repo.delete({ productoId: productoId });
    return (result.affected ?? 0) > 0;
  }
}
