import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProveedorEntityORM } from '../persistence/proveedor.orm-entity';
import { ProveedorRepository } from '../../domain/repository/proveedor.repository';
import { ProveedorMapper } from '../mappers/proveedor.mapper';
import { Proveedor } from '../../domain/entity/proveedor.entity';
import { FilterProveedorDTO } from '../../application/dto/filters-proveedor-dto';
import { TipoMovimientoEnum } from '../../../kardex/domain/entity/kardex.entity';

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
    const query = this.repo.createQueryBuilder('proveedor')
      .leftJoinAndSelect('proveedor.direcciones', 'direccion');

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

    if (filters?.isActive !== undefined) {
      query.andWhere('proveedor.isActive = :isActive', {
        isActive: filters.isActive,
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
    const result = await this.repo.update({ proveedorId }, { isActive: false });
    return (result.affected ?? 0) > 0;
  }

  async toggleActive(proveedorId: number): Promise<Proveedor> {
    const proveedor = await this.getById(proveedorId);
    if (!proveedor) {
      throw new (await import('@nestjs/common')).NotFoundException('Proveedor no encontrado');
    }
    const updated = new Proveedor(
      proveedor.proveedorId,
      proveedor.nombre,
      proveedor.nombreTitular,
      proveedor.telefono,
      proveedor.email,
      !proveedor.isActive,
    );
    return this.update(updated);
  }

  async getSuppliedProductCount(proveedorId: number): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('proveedor')
      .innerJoin('proveedor.productos', 'producto')
      .innerJoin('producto.kardexMovimientos', 'ajuste')
      .where('proveedor.proveedorId = :proveedorId', { proveedorId })
      .andWhere('ajuste.tipoMovimiento = :tipo', { tipo: TipoMovimientoEnum.ENTRADA })
      .select('COALESCE(SUM(ajuste.cantidad), 0)', 'total')
      .getRawOne<{ total: string }>();

    return parseInt(result?.total || '0', 10);
  }
}
