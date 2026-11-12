import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EstadoPedidoEnum } from '../../../pedido/domain/entity/pedido.entity';
import { PedidoEntityORM } from '../../../pedido/infrastructure/persistence/pedido.orm-entity';
import { PedidoDetalleEntityORM } from '../../../pedido-detalle/infrastructure/persistence/pedido-detalle.orm-entity';
import { PagoEntityORM } from '../../../pago/infrastructure/persistence/pago.orm-entity';
import { ProductoEntityORM } from '../../../producto/infrastructure/persistence/producto.orm-entity';
import { CarritoDetalleEntityORM } from '../../../carrito-detalle/infrastructure/persistence/carrito-detalle.orm-entity';
import { CarritoEntityORM } from '../../infrastructure/persistence/carrito.orm-entity';
import { KardexEntityORM, TipoMovimientoEnum, TipoReferenciaEnum } from '../../../kardex/infrastructure/persistence/kardex.orm-entity';
import { EstadoPagoEnum, MetodoPagoEnum } from '../../../pago/domain/entity/pago.entity';
import { ValidatedCartStockItem } from './validate-cart-stock.use-case';
import { StockInsufficientException } from '../errors/stock-insufficient.exception';
import { amount, cents } from '../../../shared/money';

@Injectable()
export class CreateOrderUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async ejecutar(params: {
    clienteId: number; carritoId: number; direccionId: number;
    metodoPago: MetodoPagoEnum; total: number; items: ValidatedCartStockItem[];
  }): Promise<{ pedidoId: number; total: number; numeroPedidoUsuario: number }> {
    return this.dataSource.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(4970, $1)', [params.clienteId]);
      const cart = await manager.findOne(CarritoEntityORM, {
        where: { carritoId: params.carritoId }, lock: { mode: 'pessimistic_write' },
      });
      if (!cart) throw new NotFoundException('Carrito no encontrado');
      const details = await manager.find(CarritoDetalleEntityORM, {
        where: { carritoId: cart.carritoId }, order: { productoId: 'ASC', carritoDetalleId: 'ASC' },
        lock: { mode: 'pessimistic_write' },
      });
      if (!details.length || details.length !== params.items.length || details.some((detail) =>
        !params.items.some((item) => item.carritoDetalleId === detail.carritoDetalleId && item.cantidadSolicitada === detail.cantidad))) {
        throw new ConflictException('El carrito cambió. Actualízalo antes de confirmar.');
      }
      // Stable locking order prevents deadlocks between customers.
      const products = new Map<number, ProductoEntityORM>();
      for (const id of [...new Set(details.map((detail) => detail.productoId))].sort((a, b) => a - b)) {
        const product = await manager.findOne(ProductoEntityORM, {
          where: { productoId: id }, lock: { mode: 'pessimistic_write' },
        });
        if (!product?.isActive) throw new NotFoundException(`Producto ${id} no disponible`);
        products.set(id, product);
      }
      const requested = new Map<number, number>();
      for (const detail of details) requested.set(detail.productoId, (requested.get(detail.productoId) ?? 0) + detail.cantidad);
      const shortages = [...requested].filter(([id, quantity]) => quantity > products.get(id)!.cantidad)
        .map(([id, quantity]) => ({ nombre: products.get(id)!.nombre, stockDisponible: products.get(id)!.cantidad, cantidadSolicitada: quantity }));
      if (shortages.length) throw new StockInsufficientException(shortages);

      const total = amount(details.reduce((sum, detail) => sum + cents(products.get(detail.productoId)!.precio) * detail.cantidad, 0));
      const nextNumber = await manager.getRepository(PedidoEntityORM).createQueryBuilder('pedido')
        .select('COALESCE(MAX(pedido.numeroPedidoUsuario), 0)', 'max')
        .where('pedido.clienteId = :clienteId', { clienteId: params.clienteId }).getRawOne<{ max: string }>();
      const numeroPedidoUsuario = Number(nextNumber?.max ?? 0) + 1;
      const order = await manager.save(PedidoEntityORM, manager.create(PedidoEntityORM, {
        clienteId: params.clienteId, direccionId: params.direccionId,
        estado: EstadoPedidoEnum.CONFIRMADO, total, numeroPedidoUsuario,
      }));
      for (const detail of details) {
        const product = products.get(detail.productoId)!;
        const precioUnitario = amount(cents(product.precio));
        const subtotal = amount(cents(precioUnitario) * detail.cantidad);
        await manager.insert(PedidoDetalleEntityORM, {
          pedidoId: order.pedidoId, productoId: product.productoId,
          cantidad: detail.cantidad, precioUnitario, subtotal,
        });
        await manager.insert(KardexEntityORM, {
          productoId: product.productoId, tipoMovimiento: TipoMovimientoEnum.SALIDA,
          cantidad: detail.cantidad, costoUnitario: precioUnitario, valorTotal: subtotal,
          referenciaId: order.pedidoId, tipoReferencia: TipoReferenciaEnum.VENTA,
        });
      }
      for (const [id, quantity] of requested) {
        const product = products.get(id)!;
        product.cantidad -= quantity;
        product.updatedAt = new Date();
        await manager.save(ProductoEntityORM, product);
      }
      await manager.insert(PagoEntityORM, {
        pedidoId: order.pedidoId, metodoPago: params.metodoPago, monto: total, estado: EstadoPagoEnum.PENDIENTE,
      });
      for (const detail of details) await manager.delete(CarritoDetalleEntityORM, { carritoDetalleId: detail.carritoDetalleId });
      cart.updatedAt = new Date();
      await manager.save(CarritoEntityORM, cart);
      return { pedidoId: order.pedidoId, total, numeroPedidoUsuario };
    });
  }
}
