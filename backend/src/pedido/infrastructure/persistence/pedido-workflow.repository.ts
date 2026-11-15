import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { PedidoWorkflowRepository } from '../../domain/repository/pedido-workflow.repository';
import type {
  OwnPedidoFilters,
  PedidoAction,
  PedidoActor,
  PedidoCommand,
  PedidoFilters,
  PedidoView,
} from '../../domain/pedido-workflow.types';
import { PedidoEntityORM } from './pedido.orm-entity';
import { PedidoEventoEntityORM } from './pedido-evento.orm-entity';
import { PedidoReembolsoEntityORM } from './pedido-reembolso.orm-entity';
import { EstadoPedidoEnum } from '../../domain/entity/pedido.entity';
import { PagoEntityORM } from '../../../pago/infrastructure/persistence/pago.orm-entity';
import { EstadoPagoEnum } from '../../../pago/domain/entity/pago.entity';
import { ProductoEntityORM } from '../../../producto/infrastructure/persistence/producto.orm-entity';
import { PedidoDetalleEntityORM } from '../../../pedido-detalle/infrastructure/persistence/pedido-detalle.orm-entity';
import {
  KardexEntityORM,
  TipoMovimientoEnum,
  TipoReferenciaEnum,
} from '../../../kardex/infrastructure/persistence/kardex.orm-entity';
import { cents } from '../../../shared/money';
import { validateStock } from '../../../inventory/infrastructure/stock-transaction';
import {
  loadPedidoView,
  pedidoSummary,
  recordPedidoEvent,
} from './pedido-workflow.helpers';
@Injectable()
export class TypeOrmPedidoWorkflowRepository implements PedidoWorkflowRepository {
  constructor(private readonly db: DataSource) {}
  get(id: number, customerUserId?: number) {
    return this.db.transaction('REPEATABLE READ', async (manager) => {
      await manager.query('SET TRANSACTION READ ONLY');
      if (customerUserId !== undefined)
        await this.own(manager, id, customerUserId);
      return loadPedidoView(manager, id);
    });
  }
  async list(filters: PedidoFilters) {
    const page = filters.page ?? 1,
      limit = filters.limit ?? 10;
    const query = this.db
      .getRepository(PedidoEntityORM)
      .createQueryBuilder('pedido');
    if (filters.clienteId)
      query.andWhere('pedido.clienteId=:client', { client: filters.clienteId });
    if (filters.direccionId)
      query.andWhere('pedido.direccionId=:address', {
        address: filters.direccionId,
      });
    if (filters.estado)
      query.andWhere('pedido.estado=:state', { state: filters.estado });
    const [rows, total] = await query
      .orderBy('pedido.pedidoId', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return {
      data: rows.map(pedidoSummary),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  listOwn(clienteId: number, filters: OwnPedidoFilters) {
    if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo)
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la final',
      );
    return this.db.transaction('REPEATABLE READ', async (manager) => {
      await manager.query('SET TRANSACTION READ ONLY');
      const query = manager
        .getRepository(PedidoEntityORM)
        .createQueryBuilder('pedido')
        .where('pedido.clienteId=:client', { client: clienteId });
      if (filters.estado)
        query.andWhere('pedido.estado=:state', { state: filters.estado });
      const calendar =
        "COALESCE(pedido.registradaEn AT TIME ZONE 'America/Bogota',pedido.fecha)";
      if (filters.dateFrom)
        query.andWhere(`${calendar}>=:start::date`, {
          start: filters.dateFrom,
        });
      if (filters.dateTo)
        query.andWhere(`${calendar}<:end::date+INTERVAL '1 day'`, {
          end: filters.dateTo,
        });
      const orders = {
        fecha_desc: [calendar, 'DESC'],
        fecha_asc: [calendar, 'ASC'],
        total_desc: ['pedido.total', 'DESC'],
        total_asc: ['pedido.total', 'ASC'],
      } as const;
      const [column, direction] = orders[filters.sortBy ?? 'fecha_desc'];
      const rows = await query
        .orderBy(column, direction)
        .addOrderBy('pedido.pedidoId', direction)
        .getMany();
      const views: PedidoView[] = [];
      for (const row of rows)
        views.push(await loadPedidoView(manager, row.pedidoId));
      return views;
    });
  }
  execute(
    id: number,
    action: PedidoAction,
    command: PedidoCommand,
    actor: PedidoActor,
  ) {
    return this.db.transaction(async (manager) => {
      const order = await manager.findOne(PedidoEntityORM, {
        where: { pedidoId: id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) throw new NotFoundException('Pedido no encontrado');
      if (actor.customerOnly) await this.own(manager, id, actor.usuarioId);
      if (!order.version)
        throw new ConflictException(
          'Pedido histórico de solo lectura; no se presume una restitución de stock',
        );
      if (order.version !== command.version) {
        const previous = await manager.findOneBy(PedidoEventoEntityORM, {
          pedidoId: id,
          version: command.version + 1,
        });
        if (
          previous?.accion === action &&
          previous.usuarioId === actor.usuarioId &&
          previous.motivo === command.motivo &&
          previous.solicitud.pagoId === command.pagoId
        )
          return loadPedidoView(manager, id);
        throw new ConflictException(
          'El pedido cambió. Actualiza el detalle antes de continuar',
        );
      }
      const payments = await manager.find(PagoEntityORM, {
        where: { pedidoId: id },
        order: { pagoId: 'DESC' },
        lock: { mode: 'pessimistic_write' },
      });
      const approved = payments.filter(
        (p) => p.estado === EstadoPagoEnum.APROBADO,
      );
      if (
        approved.length > 1 ||
        payments.some(
          (p) => cents(Number(p.monto)) !== cents(Number(order.total)),
        )
      )
        throw new ConflictException(
          'Pagos incompatibles con el total del pedido',
        );
      const latest = payments[0];
      if (!latest) throw new ConflictException('Pedido sin pago interno');
      if (['APROBAR_PAGO', 'RECHAZAR_PAGO'].includes(action)) {
        this.state(order, EstadoPedidoEnum.CONFIRMADO);
        if (
          latest.pagoId !== command.pagoId ||
          latest.estado !== EstadoPagoEnum.PENDIENTE ||
          approved.length
        )
          throw new ConflictException(
            'Selecciona el intento pendiente vigente',
          );
        latest.estado =
          action === 'APROBAR_PAGO'
            ? EstadoPagoEnum.APROBADO
            : EstadoPagoEnum.RECHAZADO;
        latest.decididoEn = new Date();
        await manager.save(PagoEntityORM, latest);
      } else {
        if (command.pagoId !== undefined)
          throw new BadRequestException('Esta operación no admite pagoId');
        switch (action) {
          case 'REINTENTAR_PAGO':
            this.state(order, EstadoPedidoEnum.CONFIRMADO);
            if (latest.estado !== EstadoPagoEnum.RECHAZADO || approved.length)
              throw new ConflictException(
                'Solo se reintenta un pago rechazado',
              );
            await manager.insert(PagoEntityORM, {
              pedidoId: id,
              metodoPago: latest.metodoPago,
              monto: Number(order.total),
              estado: EstadoPagoEnum.PENDIENTE,
              registradoEn: new Date(),
            });
            break;
          case 'ENVIAR':
            this.state(order, EstadoPedidoEnum.CONFIRMADO);
            if (
              approved.length !== 1 ||
              latest.estado !== EstadoPagoEnum.APROBADO
            )
              throw new ConflictException(
                'Se necesita pago aprobado antes de enviar',
              );
            order.estado = EstadoPedidoEnum.ENVIADO;
            break;
          case 'ENTREGAR':
            this.state(order, EstadoPedidoEnum.ENVIADO);
            if (approved.length !== 1)
              throw new ConflictException(
                'Se necesita pago aprobado para completar',
              );
            order.estado = EstadoPedidoEnum.COMPLETADO;
            break;
          case 'CANCELAR':
          case 'DEVOLVER':
            this.state(
              order,
              action === 'CANCELAR'
                ? EstadoPedidoEnum.CONFIRMADO
                : EstadoPedidoEnum.COMPLETADO,
            );
            await this.restore(manager, order, action);
            order.estado =
              action === 'CANCELAR'
                ? EstadoPedidoEnum.CANCELADO
                : EstadoPedidoEnum.DEVUELTO;
            for (const payment of payments)
              if (payment.estado === EstadoPagoEnum.PENDIENTE) {
                payment.estado = EstadoPagoEnum.ANULADO;
                payment.decididoEn = new Date();
                await manager.save(PagoEntityORM, payment);
              }
            if (approved.length)
              await manager.insert(PedidoReembolsoEntityORM, {
                pedidoId: id,
                estado: 'PENDIENTE',
                monto: Number(order.total),
                creadaEn: new Date(),
              });
            break;
          case 'REGISTRAR_REEMBOLSO': {
            if (
              ![EstadoPedidoEnum.CANCELADO, EstadoPedidoEnum.DEVUELTO].includes(
                order.estado,
              )
            )
              throw new ConflictException(
                'Solo se reembolsa un pedido cancelado o devuelto',
              );
            const refund = await manager.findOne(PedidoReembolsoEntityORM, {
              where: { pedidoId: id },
              lock: { mode: 'pessimistic_write' },
            });
            if (
              !refund ||
              refund.estado !== 'PENDIENTE' ||
              approved.length !== 1 ||
              cents(Number(refund.monto)) !== cents(Number(order.total))
            )
              throw new ConflictException(
                'No existe reembolso pendiente válido',
              );
            refund.estado = 'REGISTRADO';
            refund.registradaPor = actor.usuarioId;
            refund.registradaEn = new Date();
            refund.motivo = command.motivo;
            await manager.save(PedidoReembolsoEntityORM, refund);
            break;
          }
        }
      }
      order.version++;
      await manager.save(PedidoEntityORM, order);
      await recordPedidoEvent(
        manager,
        id,
        actor.usuarioId,
        action,
        command.motivo,
        command.pagoId,
      );
      return loadPedidoView(manager, id);
    });
  }
  private state(order: PedidoEntityORM, state: EstadoPedidoEnum) {
    if (order.estado !== state)
      throw new ConflictException(`La operación requiere estado ${state}`);
  }
  private async own(manager: EntityManager, id: number, userId: number) {
    const order = await manager.findOne(PedidoEntityORM, {
      where: { pedidoId: id },
      relations: ['cliente'],
    });
    if (!order || order.cliente.usuarioId !== userId)
      throw new NotFoundException('Pedido no encontrado');
  }
  private async restore(
    manager: EntityManager,
    order: PedidoEntityORM,
    action: 'CANCELAR' | 'DEVOLVER',
  ) {
    const lines = await manager.find(PedidoDetalleEntityORM, {
      where: { pedidoId: order.pedidoId },
      order: { productoId: 'ASC', pedidoDetalleId: 'ASC' },
    });
    if (
      !lines.length ||
      lines.some(
        (l) =>
          !Number.isInteger(l.cantidad) ||
          l.cantidad <= 0 ||
          cents(Number(l.subtotal)) !==
            cents(Number(l.precioUnitario)) * l.cantidad,
      ) ||
      cents(Number(order.total)) !==
        lines.reduce((n, l) => n + cents(Number(l.subtotal)), 0)
    )
      throw new ConflictException(
        'Líneas incompatibles con el total del pedido',
      );
    const quantities = new Map<number, number>();
    for (const line of lines)
      quantities.set(
        line.productoId,
        (quantities.get(line.productoId) ?? 0) + line.cantidad,
      );
    const sales = await manager.query<
      { producto_id: number; quantity: string }[]
    >(
      "SELECT producto_id,SUM(cantidad) AS quantity FROM kardex WHERE tipo_referencia='VENTA' AND tipo_movimiento='SALIDA' AND referencia_id=$1 GROUP BY producto_id",
      [order.pedidoId],
    );
    if (
      sales.length !== quantities.size ||
      sales.some((s) => Number(s.quantity) !== quantities.get(s.producto_id))
    )
      throw new ConflictException(
        'La salida original no coincide; requiere revisión del historial',
      );
    const reference =
      action === 'CANCELAR'
        ? TipoReferenciaEnum.CANCELACION_PEDIDO
        : TipoReferenciaEnum.DEVOLUCION_PEDIDO;
    if (
      await manager.existsBy(KardexEntityORM, {
        referenciaId: order.pedidoId,
        tipoReferencia: reference,
      })
    )
      throw new ConflictException('La restitución ya está registrada');
    for (const [id, quantity] of [...quantities].sort(([a], [b]) => a - b)) {
      const product = await manager.findOne(ProductoEntityORM, {
        where: { productoId: id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!product)
        throw new ConflictException('Producto de la devolución no disponible');
      validateStock(product.cantidad + quantity);
      product.cantidad += quantity;
      product.updatedAt = new Date();
      await manager.save(ProductoEntityORM, product);
    }
    for (const line of lines)
      await manager.insert(KardexEntityORM, {
        productoId: line.productoId,
        tipoMovimiento: TipoMovimientoEnum.ENTRADA,
        cantidad: line.cantidad,
        costoUnitario: Number(line.precioUnitario),
        valorTotal: Number(line.subtotal),
        referenciaId: order.pedidoId,
        tipoReferencia: reference,
        registradoEn: new Date(),
      });
  }
}
