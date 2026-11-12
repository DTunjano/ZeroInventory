import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KardexRepository } from '../../domain/repository/kardex.repository';
import { Kardex } from '../../domain/entity/kardex.entity';
import { KardexEntityORM } from './kardex.orm-entity';
import { KardexMapper } from '../mappers/kardex.mapper';
import { FilterKardexDTO } from '../../application/dto/filters-kardex-dto';

@Injectable()
export class KardexRepositoryImpl implements KardexRepository {
  constructor(
    @InjectRepository(KardexEntityORM)
    private readonly kardexRepository: Repository<KardexEntityORM>,
  ) {}

  async create(kardex: Kardex): Promise<Kardex> {
    const kardexORM = KardexMapper.toPersistence(kardex);
    const result = await this.kardexRepository.save(kardexORM);
    return KardexMapper.toDomain(result);
  }

  async getById(id: number): Promise<Kardex | null> {
    const kardexORM = await this.kardexRepository.findOne({
      where: { kardexId: id },
    });
    return kardexORM ? KardexMapper.toDomain(kardexORM) : null;
  }

  async getByProductoId(productoId: number): Promise<Kardex[]> {
    const kardexesORM = await this.kardexRepository.find({
      where: { productoId },
    });
    return kardexesORM.map((kardexORM) => KardexMapper.toDomain(kardexORM));
  }

  async getByReferenciaId(referenciaId: number): Promise<Kardex[]> {
    const kardexesORM = await this.kardexRepository.find({
      where: { referenciaId },
    });
    return kardexesORM.map((kardexORM) => KardexMapper.toDomain(kardexORM));
  }

  async getAll(filters?: FilterKardexDTO): Promise<{
    data: Kardex[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const skip = (page - 1) * limit;

    const query = this.kardexRepository.createQueryBuilder('kardex');

    if (filters?.tipoMovimiento) {
      query.andWhere('kardex.tipoMovimiento = :tipoMovimiento', {
        tipoMovimiento: filters.tipoMovimiento,
      });
    }

    if (filters?.tipoReferencia) {
      query.andWhere('kardex.tipoReferencia = :tipoReferencia', {
        tipoReferencia: filters.tipoReferencia,
      });
    }

    const [entities, total] = await query
      .orderBy('kardex.fechaMovimiento', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = entities.map((e) => KardexMapper.toDomain(e));
    const totalPages = Math.ceil(total / limit);

    return { data, total, page, limit, totalPages };
  }

  async update(kardex: Kardex): Promise<Kardex> {
    const entity = KardexMapper.toPersistence(kardex);
    const updated = await this.kardexRepository.save(entity);
    return KardexMapper.toDomain(updated);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.kardexRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
