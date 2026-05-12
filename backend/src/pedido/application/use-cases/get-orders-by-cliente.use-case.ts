import { Injectable } from '@nestjs/common';
import { PedidoRepository } from '../../domain/repository/pedido.repository';
import { Pedido } from '../../domain/entity/pedido.entity';

@Injectable()
export class GetOrdersByClienteUseCase {
  constructor(private readonly pedidoRepo: PedidoRepository) {}

  async ejecutar(clienteId: number): Promise<Pedido[]> {
    return this.pedidoRepo.getAll({ clienteId, limit: 1000, page: 1 }).then((result) => result.data);
  }
}
