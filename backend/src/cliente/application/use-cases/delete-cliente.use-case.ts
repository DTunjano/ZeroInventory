import { Injectable, NotFoundException } from '@nestjs/common';
import { ClienteRepository } from '../../domain/repository/cliente.repository';

@Injectable()
export class DeleteClienteUseCase {
  constructor(private readonly clienteRepo: ClienteRepository) {}

  async ejecutar(id: number): Promise<void> {
    const deleted = await this.clienteRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('Cliente no encontrado');
    }
  }
}
