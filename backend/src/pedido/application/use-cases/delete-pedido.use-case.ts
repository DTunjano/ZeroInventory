import { Injectable, NotFoundException } from '@nestjs/common';
import { PedidoRepository } from '../../domain/repository/pedido.repository';

@Injectable()
export class DeletePedidoUseCase {
  constructor(private readonly pedidoRepo: PedidoRepository) {}

  async ejecutar(id: number): Promise<void> {
    const deleted = await this.pedidoRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('Pedido no encontrado');
    }
  }
}
