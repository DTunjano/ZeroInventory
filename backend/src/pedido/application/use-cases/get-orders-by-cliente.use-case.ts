import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoEntityORM } from '../../infrastructure/persistence/pedido.orm-entity';
import { ClienteRepository } from '../../../cliente/domain/repository/cliente.repository';
import { FiltersMyOrdersDTO } from '../dto/filters-my-orders.dto';

export type OrderPaymentView = {
  pagoId: number;
  pedidoId: number;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA';
  monto: number;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fechaPago: Date;
};

export type OrderItemView = {
  pedidoDetalleId: number;
  pedidoId: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type OrderView = {
  pedidoId: number;
  numeroPedidoUsuario: number;
  clienteId: number;
  direccionId: number;
  estado: 'CONFIRMADO' | 'COMPLETADO' | 'ENVIADO' | 'CANCELADO' | 'DEVUELTO';
  total: number;
  fecha: Date;
  detalles: OrderItemView[];
  pago: OrderPaymentView | null;
};

@Injectable()
export class GetOrdersByClienteUseCase {
  constructor(
    @InjectRepository(PedidoEntityORM)
    private readonly pedidoRepo: Repository<PedidoEntityORM>,
    private readonly clienteRepo: ClienteRepository,
  ) {}

  async ejecutar(clienteId: number, filters: FiltersMyOrdersDTO = {}): Promise<OrderView[]> {
    if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
      throw new BadRequestException('La fecha inicial no puede ser posterior a la final');
    }
    const query = this.pedidoRepo.createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.detalles', 'detalle')
      .leftJoinAndSelect('detalle.producto', 'producto')
      .leftJoinAndSelect('pedido.pagos', 'pago')
      .where('pedido.clienteId = :clienteId', { clienteId });
    if (filters.estado) query.andWhere('pedido.estado = :estado', { estado: filters.estado });
    if (filters.dateFrom) query.andWhere('pedido.fecha >= CAST(:dateFrom AS date)', { dateFrom: filters.dateFrom });
    if (filters.dateTo) query.andWhere("pedido.fecha < CAST(:dateTo AS date) + INTERVAL '1 day'", { dateTo: filters.dateTo });
    const orderings = {
      fecha_desc: ['pedido.fecha', 'DESC'], fecha_asc: ['pedido.fecha', 'ASC'],
      total_desc: ['pedido.total', 'DESC'], total_asc: ['pedido.total', 'ASC'],
    } as const;
    const [column, direction] = orderings[filters.sortBy ?? 'fecha_desc'];
    const pedidos = await query.orderBy(column, direction).addOrderBy('pedido.pedidoId', direction).getMany();

    return pedidos.map((pedido) => {
      const pago = pedido.pagos?.[0] ?? null;

      return {
        pedidoId: pedido.pedidoId,
        numeroPedidoUsuario: pedido.numeroPedidoUsuario,
        clienteId: pedido.clienteId,
        direccionId: pedido.direccionId,
        estado: pedido.estado,
        total: Number(pedido.total),
        fecha: pedido.fecha,
        detalles:
          pedido.detalles?.map((detalle) => ({
            pedidoDetalleId: detalle.pedidoDetalleId,
            pedidoId: detalle.pedidoId,
            productoId: detalle.productoId,
            productoNombre: detalle.producto?.nombre ?? `Producto #${detalle.productoId}`,
            cantidad: detalle.cantidad,
            precioUnitario: Number(detalle.precioUnitario),
            subtotal: Number(detalle.subtotal),
          })) ?? [],
        pago: pago
          ? {
              pagoId: pago.pagoId,
              pedidoId: pago.pedidoId,
              metodoPago: pago.metodoPago,
              monto: Number(pago.monto),
              estado: pago.estado,
              fechaPago: pago.fechaPago,
            }
          : null,
      };
    });
  }
}
