import { Injectable, NotFoundException } from '@nestjs/common';
import { PedidoRepository } from '../../domain/repository/pedido.repository';
import { Pedido, EstadoPedidoEnum } from '../../domain/entity/pedido.entity';

@Injectable()
export class UpdatePedidoUseCase {
  constructor(private readonly pedidoRepo: PedidoRepository) {}

  async ejecutar(
    pedidoId: number,
    cambios: {
      clienteId?: number;
      direccionId?: number;
      estado?: EstadoPedidoEnum;
      total?: number;
    },
  ): Promise<Pedido> {
    const actual = await this.pedidoRepo.getById(pedidoId);
    if (!actual) {
      throw new NotFoundException('Pedido no encontrado');
    }

    const pedido = new Pedido(
      actual.pedidoId,
      cambios.clienteId ?? actual.clienteId,
      cambios.direccionId ?? actual.direccionId,
      cambios.estado ?? actual.estado,
      cambios.total ?? actual.total,
      actual.fecha,
    );
    return this.pedidoRepo.update(pedido);
  }
}
