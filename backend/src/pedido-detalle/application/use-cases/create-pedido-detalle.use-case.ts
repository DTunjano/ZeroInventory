import { Injectable } from '@nestjs/common';
import { PedidoDetalleRepository } from '../../domain/repository/pedido-detalle.repository';
import { PedidoDetalle } from '../../domain/entity/pedido-detalle.entity';

@Injectable()
export class CreatePedidoDetalleUseCase {
  constructor(private readonly pedidoDetalleRepo: PedidoDetalleRepository) {}

  async ejecutar(data: {
    pedidoId: number;
    productoId: number;
    cantidad: number;
    precioUnitario: number;
  }): Promise<PedidoDetalle> {
    const subtotal = data.cantidad * data.precioUnitario;

    const pedidoDetalle = new PedidoDetalle(
      0,
      data.pedidoId,
      data.productoId,
      data.cantidad,
      data.precioUnitario,
      subtotal,
    );
    return this.pedidoDetalleRepo.create(pedidoDetalle);
  }
}
