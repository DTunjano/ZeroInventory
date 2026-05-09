import { Injectable } from '@nestjs/common';
import { PedidoDetalleRepository } from '../../domain/repository/pedido-detalle.repository';
import { PedidoDetalle } from '../../domain/entity/pedido-detalle.entity';

@Injectable()
export class UpdatePedidoDetalleUseCase {
  constructor(private readonly pedidoDetalleRepo: PedidoDetalleRepository) {}

  async ejecutar(
    pedidoDetalleId: number,
    data: {
      cantidad?: number;
      precioUnitario?: number;
    },
  ): Promise<PedidoDetalle> {
    const pedidoDetalle = await this.pedidoDetalleRepo.getById(pedidoDetalleId);
    if (!pedidoDetalle) {
      throw new Error('Pedido detalle no encontrado');
    }

    const subtotal =
      (data.cantidad ?? pedidoDetalle.cantidad) *
      (data.precioUnitario ?? pedidoDetalle.precioUnitario);

    const updated = new PedidoDetalle(
      pedidoDetalle.pedidoDetalleId,
      pedidoDetalle.pedidoId,
      pedidoDetalle.productoId,
      data.cantidad ?? pedidoDetalle.cantidad,
      data.precioUnitario ?? pedidoDetalle.precioUnitario,
      subtotal,
    );
    return this.pedidoDetalleRepo.update(updated);
  }
}
