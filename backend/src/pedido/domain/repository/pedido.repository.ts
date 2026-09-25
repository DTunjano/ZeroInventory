import { FiltersPedidoDTO } from '../../application/dto/filters-pedido-dto';
import { Pedido } from '../entity/pedido.entity';

export abstract class PedidoRepository {
  abstract create(pedido: Pedido): Promise<Pedido>;
  abstract getById(pedidoId: number): Promise<Pedido | null>;
  abstract update(pedido: Pedido): Promise<Pedido>;
  abstract delete(pedidoId: number): Promise<boolean>;
  abstract getAll(filters?: FiltersPedidoDTO): Promise<{
    data: Pedido[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
