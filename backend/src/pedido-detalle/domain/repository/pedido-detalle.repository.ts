import { FiltersPedidoDetalleDTO } from '../../application/dto/filters-pedido-detalle-dto';
import { PedidoDetalle } from '../entity/pedido-detalle.entity';

export abstract class PedidoDetalleRepository {
  abstract create(pedidoDetalle: PedidoDetalle): Promise<PedidoDetalle>;
  abstract getById(pedidoDetalleId: number): Promise<PedidoDetalle | null>;
  abstract update(pedidoDetalle: PedidoDetalle): Promise<PedidoDetalle>;
  abstract delete(pedidoDetalleId: number): Promise<boolean>;
  abstract getAll(filters?: FiltersPedidoDetalleDTO): Promise<{
    data: PedidoDetalle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
