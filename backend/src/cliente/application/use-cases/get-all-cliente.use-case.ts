import { Injectable } from '@nestjs/common';
import { ClienteRepository } from '../../domain/repository/cliente.repository';
import { Cliente } from '../../domain/entity/cliente.entity';
import { FiltersClienteDTO } from '../dto/filters-cliente-dto';

@Injectable()
export class GetAllClientesUseCase {
  constructor(private readonly clienteRepo: ClienteRepository) {}

  async ejecutar(filters?: FiltersClienteDTO): Promise<{
    data: Cliente[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.clienteRepo.getAll(filters);
  }
}
