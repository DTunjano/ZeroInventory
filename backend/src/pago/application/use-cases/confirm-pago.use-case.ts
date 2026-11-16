import { Injectable, NotFoundException } from '@nestjs/common';
import { PagoRepository } from '../../domain/repository/pago.repository';
import { PedidoRepository } from '../../../pedido/domain/repository/pedido.repository';
import { EstadoPagoEnum } from '../../domain/entity/pago.entity';
import { EstadoPedidoEnum, Pedido } from '../../../pedido/domain/entity/pedido.entity';

@Injectable()
export class ConfirmPagoUseCase {
  constructor(
    private readonly pagoRepo: PagoRepository,
    private readonly pedidoRepo: PedidoRepository,
  ) {}

  async ejecutar(pagoId: number): Promise<void> {
    const pago = await this.pagoRepo.getById(pagoId);
    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    // mark pago as approved
    await this.pagoRepo.update({
      ...pago,
      estado: EstadoPagoEnum.APROBADO,
    });

    // mark pedido as completed
    const pedido = await this.pedidoRepo.getById(pago.pedidoId);
    if (!pedido) {
      throw new NotFoundException('Pedido asociado no encontrado');
    }

    const updatedPedido = new Pedido(
      pedido.pedidoId,
      pedido.clienteId,
      pedido.direccionId,
      EstadoPedidoEnum.COMPLETADO,
      pedido.total,
      pedido.numeroPedidoUsuario,
      pedido.fecha,
    );

    await this.pedidoRepo.update(updatedPedido);
  }
}
