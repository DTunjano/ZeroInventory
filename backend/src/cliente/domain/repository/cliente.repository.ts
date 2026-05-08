import { FiltersClienteDTO } from '../../application/dto/filters-cliente-dto';
import { Cliente } from '../entity/cliente.entity';

export abstract class ClienteRepository {
  abstract create(cliente: Cliente): Promise<Cliente>;
  abstract getById(clienteId: number): Promise<Cliente | null>;
  abstract getByUsuarioId(usuarioId: number): Promise<Cliente | null>;
  abstract getByDocumento(documento: string): Promise<Cliente | null>;
  abstract getAll(filters?: FiltersClienteDTO): Promise<{
    data: Cliente[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract update(cliente: Cliente): Promise<Cliente>;
  abstract delete(clienteId: number): Promise<boolean>;
}
