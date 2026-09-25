import { Injectable } from '@nestjs/common';
import { PedidoRepository } from '../../domain/repository/pedido.repository';
import { Pedido } from '../../domain/entity/pedido.entity';

@Injectable()
export class GetPedidoByIdUseCase {
  constructor(private readonly pedidoRepo: PedidoRepository) {}

  async ejecutar(id: number): Promise<Pedido | null> {
    return this.pedidoRepo.getById(id);
  }
}
