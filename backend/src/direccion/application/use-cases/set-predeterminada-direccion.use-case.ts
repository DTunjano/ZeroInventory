import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DireccionEntityORM } from '../../infrastructure/persistence/direccion.orm-entity';
import { ClienteRepository } from '../../../cliente/domain/repository/cliente.repository';

@Injectable()
export class SetPredeterminadaDireccionUseCase {
  constructor(
    private readonly clienteRepo: ClienteRepository,
    @InjectRepository(DireccionEntityORM)
    private readonly direccionRepo: Repository<DireccionEntityORM>,
  ) {}

  async ejecutar(usuarioId: number, direccionId: number): Promise<void> {
    const cliente = await this.clienteRepo.getByUsuarioId(usuarioId);
    if (!cliente) {
      return;
    }

    const direccion = await this.direccionRepo.findOne({
      where: { direccionId, clienteId: cliente.clienteId },
    });

    if (!direccion) {
      return;
    }

    // Desmarcar todas las predeterminadas del cliente
    await this.direccionRepo.update(
      { clienteId: cliente.clienteId, esPredeterminada: true },
      { esPredeterminada: false },
    );

    // Marcar la nueva como predeterminada
    direccion.esPredeterminada = true;
    await this.direccionRepo.save(direccion);
  }
}
