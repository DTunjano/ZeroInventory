import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClienteEntityORM } from '../persistence/cliente.orm-entity';
import { ClienteRepository } from '../../domain/repository/cliente.repository';
import { ClienteMapper } from '../mappers/cliente.mapper';
import { Cliente } from '../../domain/entity/cliente.entity';
import { FiltersClienteDTO } from '../../application/dto/filters-cliente-dto';

@Injectable()
export class ClienteRepositoryImpl implements ClienteRepository {
  constructor(
    @InjectRepository(ClienteEntityORM)
    private readonly repo: Repository<ClienteEntityORM>,
  ) {}

  async create(cliente: Cliente): Promise<Cliente> {
    const entity = ClienteMapper.toPersistence(cliente);
    const saved = await this.repo.save(entity);
    return ClienteMapper.toDomain(saved);
  }

  async update(cliente: Cliente): Promise<Cliente> {
    const entity = ClienteMapper.toPersistence(cliente);
    const saved = await this.repo.save(entity);
    return ClienteMapper.toDomain(saved);
  }

  async getById(clienteId: number): Promise<Cliente | null> {
    const entity = await this.repo.findOne({
      where: { clienteId: clienteId },
    });
    return entity ? ClienteMapper.toDomain(entity) : null;
  }

  async getByUsuarioId(usuarioId: number): Promise<Cliente | null> {
    const entity = await this.repo.findOne({
      where: { usuarioId: usuarioId },
    });
    return entity ? ClienteMapper.toDomain(entity) : null;
  }

  async getByDocumento(documento: string): Promise<Cliente | null> {
    const entity = await this.repo.findOne({
      where: { documento: documento },
    });
    return entity ? ClienteMapper.toDomain(entity) : null;
  }

  async getAll(filters?: FiltersClienteDTO): Promise<{
    data: Cliente[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.repo.createQueryBuilder('cliente');

    if (filters?.usuarioId !== undefined) {
      query.andWhere('cliente.usuarioId = :usuarioId', {
        usuarioId: filters.usuarioId,
      });
    }

    if (filters?.tipoDocumento) {
      query.andWhere('cliente.tipoDocumento = :tipoDocumento', {
        tipoDocumento: filters.tipoDocumento,
      });
    }

    if (filters?.documento) {
      query.andWhere('cliente.documento ILIKE :documento', {
        documento: `%${filters.documento}%`,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    query.skip((page - 1) * limit);
    query.take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => ClienteMapper.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(clienteId: number): Promise<boolean> {
    const result = await this.repo.delete({ clienteId: clienteId });
    return (result.affected ?? 0) > 0;
  }
}
