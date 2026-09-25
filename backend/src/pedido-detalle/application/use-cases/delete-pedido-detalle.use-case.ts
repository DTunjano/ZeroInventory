import { Injectable } from '@nestjs/common';
import { PedidoDetalleRepository } from '../../domain/repository/pedido-detalle.repository';

@Injectable()
export class DeletePedidoDetalleUseCase {
  constructor(private readonly pedidoDetalleRepo: PedidoDetalleRepository) {}

  async ejecutar(pedidoDetalleId: number): Promise<boolean> {
    return this.pedidoDetalleRepo.delete(pedidoDetalleId);
  }
}
