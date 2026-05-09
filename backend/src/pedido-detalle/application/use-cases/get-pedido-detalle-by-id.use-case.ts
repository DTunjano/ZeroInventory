import { Injectable } from '@nestjs/common';
import { PedidoDetalleRepository } from '../../domain/repository/pedido-detalle.repository';
import { PedidoDetalle } from '../../domain/entity/pedido-detalle.entity';

@Injectable()
export class GetPedidoDetalleByIdUseCase {
  constructor(private readonly pedidoDetalleRepo: PedidoDetalleRepository) {}

  async ejecutar(pedidoDetalleId: number): Promise<PedidoDetalle | null> {
    return this.pedidoDetalleRepo.getById(pedidoDetalleId);
  }
}
