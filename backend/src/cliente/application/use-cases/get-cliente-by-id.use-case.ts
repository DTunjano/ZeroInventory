import { Injectable } from '@nestjs/common';
import { ClienteRepository } from '../../domain/repository/cliente.repository';
import { Cliente } from '../../domain/entity/cliente.entity';

@Injectable()
export class GetClienteByIdUseCase {
  constructor(private readonly clienteRepo: ClienteRepository) {}

  async ejecutar(id: number): Promise<Cliente | null> {
    return this.clienteRepo.getById(id);
  }
}
