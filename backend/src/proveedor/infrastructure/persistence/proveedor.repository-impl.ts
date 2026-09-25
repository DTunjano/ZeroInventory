import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProveedorEntityORM } from '../persistence/proveedor.orm-entity';
import { ProveedorRepository } from '../../domain/repository/proveedor.repository';
import { ProveedorMapper } from '../mappers/proveedor.mapper';
import { Proveedor } from '../../domain/entity/proveedor.entity';
import { FilterProveedorDTO } from '../../application/dto/filters-proveedor-dto';

@Injectable()
export class ProveedorRepositoryImpl implements ProveedorRepository {
  constructor(
    @InjectRepository(ProveedorEntityORM)
    private readonly repo: Repository<ProveedorEntityORM>,
  ) {}

  async create(proveedor: Proveedor): Promise<Proveedor> {
    const entity = ProveedorMapper.toPersistence(proveedor);
    const saved = await this.repo.save(entity);
    return ProveedorMapper.toDomain(saved);
  }

  async update(proveedor: Proveedor): Promise<Proveedor> {
    const entity = ProveedorMapper.toPersistence(proveedor);
    const saved = await this.repo.save(entity);
    return ProveedorMapper.toDomain(saved);
  }

  async getById(proveedorId: number): Promise<Proveedor | null> {
    const entity = await this.repo.findOne({
      where: { proveedorId: proveedorId },
    });
    return entity ? ProveedorMapper.toDomain(entity) : null;
  }

  async getByNombre(nombre: string): Promise<Proveedor | null> {
    const entity = await this.repo.findOne({
      where: { nombre: nombre },
    });
    return entity ? ProveedorMapper.toDomain(entity) : null;
  }

  async getAll(filters?: FilterProveedorDTO): Promise<{
    data: Proveedor[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repo.createQueryBuilder('proveedor');

    if (filters?.nombre) {
      query.andWhere('proveedor.nombre ILIKE :nombre', {
        nombre: `%${filters.nombre}%`,
      });
    }

    if (filters?.email) {
      query.andWhere('proveedor.email ILIKE :email', {
        email: `%${filters.email}%`,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    query.skip((page - 1) * limit);
    query.take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => ProveedorMapper.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(proveedorId: number): Promise<boolean> {
    const result = await this.repo.delete({ proveedorId: proveedorId });
    return (result.affected ?? 0) > 0;
  }
}
