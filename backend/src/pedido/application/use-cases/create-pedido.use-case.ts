import { Injectable } from '@nestjs/common';
import { PedidoRepository } from '../../domain/repository/pedido.repository';
import { Pedido, EstadoPedidoEnum } from '../../domain/entity/pedido.entity';

@Injectable()
export class CreatePedidoUseCase {
  constructor(private readonly pedidoRepo: PedidoRepository) {}

  async ejecutar(data: {
    clienteId: number;
    direccionId: number;
    estado?: EstadoPedidoEnum;
    total?: number;
  }): Promise<Pedido> {
    const pedido = new Pedido(
      0,
      data.clienteId,
      data.direccionId,
      data.estado ?? EstadoPedidoEnum.CONFIRMADO,
      data.total ?? 0,
      new Date(),
    );
    return this.pedidoRepo.create(pedido);
  }
}
