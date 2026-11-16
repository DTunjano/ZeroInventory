import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { WompiRepository, WompiTransaction } from '../domain/wompi.types';
import { WompiIntentoEntityORM } from './wompi-intento.orm-entity';
import { PedidoEntityORM } from '../../pedido/infrastructure/persistence/pedido.orm-entity';
import { EstadoPedidoEnum } from '../../pedido/domain/entity/pedido.entity';
import { PagoEntityORM } from '../../pago/infrastructure/persistence/pago.orm-entity';
import {
  EstadoPagoEnum,
  MetodoPagoEnum,
} from '../../pago/domain/entity/pago.entity';
import { PedidoReembolsoEntityORM } from '../../pedido/infrastructure/persistence/pedido-reembolso.orm-entity';
import { cents } from '../../shared/money';
import { recordPedidoEvent } from '../../pedido/infrastructure/persistence/pedido-workflow.helpers';

@Injectable()
export class TypeOrmWompiRepository implements WompiRepository {
  constructor(private readonly db: DataSource) {}
  async authorize(orderId: number, userId: number) {
    const count = await this.db
      .getRepository(PedidoEntityORM)
      .createQueryBuilder('pedido')
      .innerJoin('pedido.cliente', 'cliente')
      .where('pedido.pedidoId=:orderId AND cliente.usuarioId=:userId', {
        orderId,
        userId,
      })
      .getCount();
    if (!count) throw new NotFoundException('Pedido no encontrado');
  }
  async findReference(reference: string) {
    const row = await this.db
      .getRepository(WompiIntentoEntityORM)
      .findOne({ where: { referencia: reference }, relations: ['pago'] });
    return row ? { pedidoId: row.pago.pedidoId } : null;
  }
  async checkout(orderId: number, userId: number) {
    await this.authorize(orderId, userId);
    return this.db.transaction(async (manager) => {
      const order = await manager.findOne(PedidoEntityORM, {
        where: { pedidoId: orderId },
        lock: { mode: 'pessimistic_write' },
      });
      if (
        !order ||
        order.version === 0 ||
        order.estado !== EstadoPedidoEnum.CONFIRMADO
      )
        throw new ConflictException(
          'Solo se pagan pedidos confirmados vigentes',
        );
      const payments = await manager.find(PagoEntityORM, {
        where: { pedidoId: orderId },
        order: { pagoId: 'DESC' },
        lock: { mode: 'pessimistic_write' },
      });
      let payment = payments[0];
      if (
        !payment ||
        payment.metodoPago !== MetodoPagoEnum.WOMPI ||
        payments.some((p) => p.estado === EstadoPagoEnum.APROBADO)
      )
        throw new ConflictException(
          'El pedido no admite un intento Wompi pendiente',
        );
      if (payment.estado === EstadoPagoEnum.RECHAZADO) {
        const previous = await manager.findOneBy(WompiIntentoEntityORM, {
          pagoId: payment.pagoId,
        });
        if (
          !previous ||
          !['DECLINED', 'VOIDED', 'ERROR'].includes(
            previous.estadoProveedor ?? '',
          )
        )
          throw new ConflictException(
            'Verifica el intento anterior antes de reintentar',
          );
        payment = await manager.save(
          PagoEntityORM,
          manager.create(PagoEntityORM, {
            pedidoId: orderId,
            metodoPago: MetodoPagoEnum.WOMPI,
            monto: Number(order.total),
            estado: EstadoPagoEnum.PENDIENTE,
            registradoEn: new Date(),
          }),
        );
        order.version++;
        await manager.save(PedidoEntityORM, order);
        await recordPedidoEvent(
          manager,
          orderId,
          userId,
          'REINTENTAR_PAGO',
          'Nuevo intento Wompi Sandbox solicitado por el cliente',
        );
      }
      if (
        payment.estado !== EstadoPagoEnum.PENDIENTE ||
        cents(Number(payment.monto)) !== cents(Number(order.total))
      )
        throw new ConflictException(
          'El intento no coincide con el total pendiente',
        );
      let intent = await manager.findOneBy(WompiIntentoEntityORM, {
        pagoId: payment.pagoId,
      });
      if (!intent)
        intent = await manager.save(
          WompiIntentoEntityORM,
          manager.create(WompiIntentoEntityORM, {
            pagoId: payment.pagoId,
            referencia: `zi-test-${randomUUID()}`,
            ambiente: 'sandbox',
            creadoEn: new Date(),
          }),
        );
      return {
        pedidoId: orderId,
        pagoId: payment.pagoId,
        reference: intent.referencia,
        amountInCents: cents(Number(order.total)),
      };
    });
  }
  async apply(transaction: WompiTransaction, orderId: number) {
    return this.db.transaction(async (manager) => {
      const order = await manager.findOne(PedidoEntityORM, {
        where: { pedidoId: orderId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order || !order.version)
        throw new ConflictException('Pedido no disponible para conciliación');
      const intent = await manager.findOne(WompiIntentoEntityORM, {
        where: { referencia: transaction.reference },
        lock: { mode: 'pessimistic_write' },
      });
      if (!intent || intent.ambiente !== 'sandbox')
        throw new ConflictException('Referencia Wompi no registrada');
      const payment = await manager.findOne(PagoEntityORM, {
        where: { pagoId: intent.pagoId, pedidoId: orderId },
        lock: { mode: 'pessimistic_write' },
      });
      if (
        !payment ||
        payment.metodoPago !== MetodoPagoEnum.WOMPI ||
        transaction.currency !== 'COP' ||
        cents(Number(payment.monto)) !== transaction.amountInCents ||
        cents(Number(order.total)) !== transaction.amountInCents
      )
        throw new ConflictException('La transacción no coincide con el pedido');
      if (intent.transaccionId && intent.transaccionId !== transaction.id)
        throw new ConflictException(
          'Referencia vinculada a otra transacción; requiere revisión',
        );
      if (intent.estadoProveedor && intent.estadoProveedor !== 'PENDING') {
        if (intent.estadoProveedor !== transaction.status)
          throw new ConflictException(
            'El proveedor cambió un resultado final; requiere revisión',
          );
        return {
          pedidoId: orderId,
          estado: order.estado,
          paymentStatus: payment.estado,
        };
      }
      intent.transaccionId = transaction.id;
      intent.estadoProveedor = transaction.status;
      intent.verificadoEn = new Date();
      await manager.save(WompiIntentoEntityORM, intent);
      if (transaction.status !== 'PENDING') {
        if (transaction.status === 'APPROVED') {
          const approved = await manager.findOneBy(PagoEntityORM, {
            pedidoId: orderId,
            estado: EstadoPagoEnum.APROBADO,
          });
          if (approved && approved.pagoId !== payment.pagoId)
            throw new ConflictException(
              'Existe otro pago aprobado; requiere revisión',
            );
          if (!['CONFIRMADO', 'CANCELADO'].includes(order.estado))
            throw new ConflictException(
              'Estado incompatible con una aprobación nueva',
            );
          payment.estado = EstadoPagoEnum.APROBADO;
          if (
            order.estado === EstadoPedidoEnum.CANCELADO &&
            !(await manager.existsBy(PedidoReembolsoEntityORM, {
              pedidoId: orderId,
            }))
          )
            await manager.insert(PedidoReembolsoEntityORM, {
              pedidoId: orderId,
              estado: 'PENDIENTE',
              monto: Number(order.total),
              creadaEn: new Date(),
            });
        } else if (payment.estado === EstadoPagoEnum.PENDIENTE)
          payment.estado = EstadoPagoEnum.RECHAZADO;
        payment.decididoEn = new Date();
        await manager.save(PagoEntityORM, payment);
        order.version++;
        await manager.save(PedidoEntityORM, order);
        await recordPedidoEvent(
          manager,
          orderId,
          null,
          'WOMPI_VERIFICADO',
          `Wompi Sandbox verificado: ${transaction.status}`,
          payment.pagoId,
        );
      }
      return {
        pedidoId: orderId,
        estado: order.estado,
        paymentStatus: payment.estado,
      };
    });
  }
}
