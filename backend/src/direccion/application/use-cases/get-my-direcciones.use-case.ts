import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DireccionEntityORM } from '../../infrastructure/persistence/direccion.orm-entity';
import { ClienteRepository } from '../../../cliente/domain/repository/cliente.repository';
import { Direccion } from '../../domain/entity/direccion.entity';
import { DireccionMapper } from '../../infrastructure/mappers/direccion.mapper';

@Injectable()
export class GetMyDireccionesUseCase {
  constructor(
    private readonly clienteRepo: ClienteRepository,
    @InjectRepository(DireccionEntityORM)
    private readonly direccionRepo: Repository<DireccionEntityORM>,
  ) {}

  async ejecutar(usuarioId: number): Promise<Direccion[]> {
    const cliente = await this.clienteRepo.getByUsuarioId(usuarioId);
    if (!cliente) {
      return [];
    }

    // Order: predeterminada primero, luego por id ascendente
    const entities = await this.direccionRepo.find({
      where: { clienteId: cliente.clienteId, estado: true },
      order: { esPredeterminada: 'DESC', direccionId: 'ASC' },
    });

    return entities.map((e) => DireccionMapper.toDomain(e));
  }
}
