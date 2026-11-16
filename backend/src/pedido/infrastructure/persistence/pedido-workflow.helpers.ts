import { NotFoundException } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { WompiIntentoEntityORM } from '../../../wompi/infrastructure/wompi-intento.orm-entity';
import { PedidoEntityORM } from './pedido.orm-entity';
import { PedidoEventoEntityORM } from './pedido-evento.orm-entity';
import { PedidoReembolsoEntityORM } from './pedido-reembolso.orm-entity';
import { PedidoDetalleEntityORM } from '../../../pedido-detalle/infrastructure/persistence/pedido-detalle.orm-entity';
import { PagoEntityORM } from '../../../pago/infrastructure/persistence/pago.orm-entity';
import type {
  PedidoEvent,
  PedidoSummary,
  PedidoView,
} from '../../domain/pedido-workflow.types';
export function pedidoSummary(p: PedidoEntityORM): PedidoSummary {
  return {
    pedidoId: p.pedidoId,
    clienteId: p.clienteId,
    direccionId: p.direccionId,
    numeroPedidoUsuario: p.numeroPedidoUsuario,
    estado: p.estado,
    total: Number(p.total),
    fecha: p.registradaEn ?? p.fecha,
    version: p.version,
  };
}
export async function loadPedidoView(
  manager: EntityManager,
  id: number,
): Promise<PedidoView> {
  const order = await manager.findOneBy(PedidoEntityORM, { pedidoId: id });
  if (!order) throw new NotFoundException('Pedido no encontrado');
  const lines = await manager.find(PedidoDetalleEntityORM, {
    where: { pedidoId: id },
    relations: ['producto'],
    order: { pedidoDetalleId: 'ASC' },
  });
  const payments = await manager.find(PagoEntityORM, {
    where: { pedidoId: id },
    order: { pagoId: 'DESC' },
  });
  const refund = await manager.findOneBy(PedidoReembolsoEntityORM, {
    pedidoId: id,
  });
  const events = await manager.find(PedidoEventoEntityORM, {
    where: { pedidoId: id },
    order: { version: 'ASC' },
  });
  const intents = await manager.findBy(WompiIntentoEntityORM, { pagoId: In(payments.map(p => p.pagoId)) });
  const pagos = payments.map((p) => ({
    pagoId: p.pagoId,
    pedidoId: p.pedidoId,
    metodoPago: p.metodoPago,
    estado: p.estado,
    monto: Number(p.monto),
    fechaPago: p.decididoEn ?? p.registradoEn ?? p.fechaPago,
    ...(() => {
      const intent = intents.find(i => i.pagoId === p.pagoId);
      return intent ? { wompi: { environment: intent.ambiente, reference: intent.referencia, transactionId: intent.transaccionId, status: intent.estadoProveedor } } : {};
    })(),
  }));
  return {
    ...pedidoSummary(order),
    detalles: lines.map((l) => ({
      pedidoDetalleId: l.pedidoDetalleId,
      pedidoId: id,
      productoId: l.productoId,
      productoNombre: l.producto.nombre,
      cantidad: l.cantidad,
      precioUnitario: Number(l.precioUnitario),
      subtotal: Number(l.subtotal),
    })),
    pagos,
    pago: pagos[0] ?? null,
    reembolso: refund
      ? {
          estado: refund.estado,
          monto: Number(refund.monto),
          creadaEn: refund.creadaEn,
          registradaEn: refund.registradaEn,
          registradaPor: refund.registradaPor,
          motivo: refund.motivo,
        }
      : null,
    historial: events.map((e) => ({
      eventoId: e.eventoId,
      version: e.version,
      accion: e.accion,
      usuarioId: e.usuarioId,
      origen: e.origen,
      motivo: e.motivo,
      fecha: e.fecha,
      snapshot: e.snapshot,
    })),
  };
}
export async function recordPedidoEvent(
  manager: EntityManager,
  id: number,
  actor: number | null,
  action: PedidoEvent['accion'],
  motivo: string,
  pagoId?: number,
) {
  const view = await loadPedidoView(manager, id);
  await manager.insert(PedidoEventoEntityORM, {
    pedidoId: id,
    usuarioId: actor,
    origen: actor === null ? 'WOMPI' : 'USUARIO',
    version: view.version,
    accion: action,
    motivo,
    fecha: new Date(),
    solicitud: pagoId === undefined ? {} : { pagoId },
    snapshot: {
      estado: view.estado,
      total: view.total,
      detalles: view.detalles,
      pagos: view.pagos,
      reembolso: view.reembolso,
    },
  });
}
