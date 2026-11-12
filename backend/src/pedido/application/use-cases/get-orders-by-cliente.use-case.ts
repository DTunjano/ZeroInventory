import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoEntityORM } from '../../infrastructure/persistence/pedido.orm-entity';
import { ClienteRepository } from '../../../cliente/domain/repository/cliente.repository';

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

  async ejecutar(clienteId: number): Promise<OrderView[]> {
    const pedidos = await this.pedidoRepo.find({
      where: { clienteId },
      relations: ['detalles', 'detalles.producto', 'pagos'],
      order: { fecha: 'DESC' },
    });

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
