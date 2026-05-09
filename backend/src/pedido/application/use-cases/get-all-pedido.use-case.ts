import { Injectable } from '@nestjs/common';
import { PedidoRepository } from '../../domain/repository/pedido.repository';
import { Pedido } from '../../domain/entity/pedido.entity';
import { FiltersPedidoDTO } from '../dto/filters-pedido-dto';

@Injectable()
export class GetAllPedidosUseCase {
  constructor(private readonly pedidoRepo: PedidoRepository) {}

  async ejecutar(filters?: FiltersPedidoDTO): Promise<{
    data: Pedido[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.pedidoRepo.getAll(filters);
  }
}
