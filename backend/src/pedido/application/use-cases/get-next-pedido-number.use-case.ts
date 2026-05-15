import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoEntityORM } from '../../infrastructure/persistence/pedido.orm-entity';

@Injectable()
export class GetNextPedidoNumberUseCase {
  constructor(
    @InjectRepository(PedidoEntityORM)
    private readonly pedidoRepo: Repository<PedidoEntityORM>,
  ) {}

  async ejecutar(clienteId: number): Promise<number> {
    const result = await this.pedidoRepo
      .createQueryBuilder('pedido')
      .select('COALESCE(MAX(pedido.numeroPedidoUsuario), 0)', 'max')
      .where('pedido.clienteId = :clienteId', { clienteId })
      .getRawOne();

    return (result?.max ?? 0) + 1;
  }
}
