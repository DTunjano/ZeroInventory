import { Injectable } from '@nestjs/common';
import { PedidoDetalleRepository } from '../../domain/repository/pedido-detalle.repository';
import { FiltersPedidoDetalleDTO } from '../dto/filters-pedido-detalle-dto';
import { PedidoDetalle } from '../../domain/entity/pedido-detalle.entity';

@Injectable()
export class GetAllPedidoDetalleUseCase {
  constructor(private readonly pedidoDetalleRepo: PedidoDetalleRepository) {}

  async ejecutar(filters?: FiltersPedidoDetalleDTO): Promise<{
    data: PedidoDetalle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.pedidoDetalleRepo.getAll(filters);
  }
}
