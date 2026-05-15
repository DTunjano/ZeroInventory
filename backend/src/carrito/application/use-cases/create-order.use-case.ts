import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EstadoPedidoEnum } from '../../../pedido/domain/entity/pedido.entity';
import { PedidoEntityORM } from '../../../pedido/infrastructure/persistence/pedido.orm-entity';
import { PedidoDetalleEntityORM } from '../../../pedido-detalle/infrastructure/persistence/pedido-detalle.orm-entity';
import { PagoEntityORM } from '../../../pago/infrastructure/persistence/pago.orm-entity';
import { ProductoEntityORM } from '../../../producto/infrastructure/persistence/producto.orm-entity';
import { CarritoDetalleEntityORM } from '../../../carrito-detalle/infrastructure/persistence/carrito-detalle.orm-entity';
import { CarritoEntityORM } from '../../../carrito/infrastructure/persistence/carrito.orm-entity';
import { KardexEntityORM, TipoMovimientoEnum, TipoReferenciaEnum } from '../../../entities/kardex.orm-entity';
import { EstadoPagoEnum, MetodoPagoEnum } from '../../../pago/domain/entity/pago.entity';
import { ValidatedCartStockItem } from './validate-cart-stock.use-case';

@Injectable()
export class CreateOrderUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async ejecutar(params: {
    clienteId: number;
    carritoId: number;
    direccionId: number;
    metodoPago: MetodoPagoEnum;
    total: number;
    items: ValidatedCartStockItem[];
  }): Promise<{ pedidoId: number; total: number; numeroPedidoUsuario: number }> {
    const result = await this.dataSource.transaction(async (manager) => {
      const pedidoRepo = manager.getRepository(PedidoEntityORM);
      const nextNumberResult = await pedidoRepo
        .createQueryBuilder('pedido')
        .select('COALESCE(MAX(pedido.numeroPedidoUsuario), 0)', 'max')
        .where('pedido.clienteId = :clienteId', { clienteId: params.clienteId })
        .getRawOne();
      const numeroPedidoUsuario = (Number(nextNumberResult?.max) || 0) + 1;

      const pedidoEntity = pedidoRepo.create({
        clienteId: params.clienteId,
        direccionId: params.direccionId,
        estado: EstadoPedidoEnum.CONFIRMADO,
        total: params.total,
        numeroPedidoUsuario,
      } as Partial<PedidoEntityORM>);
      const savedPedido = await pedidoRepo.save(pedidoEntity);

      const pedidoDetalleRepo = manager.getRepository(PedidoDetalleEntityORM);
      const productoRepo = manager.getRepository(ProductoEntityORM);
      const kardexRepo = manager.getRepository(KardexEntityORM);

      for (const item of params.items) {
        const detalleEntity = pedidoDetalleRepo.create({
          pedidoId: savedPedido.pedidoId,
          productoId: item.productoId,
          cantidad: item.cantidadSolicitada,
          precioUnitario: item.precioUnitario,
          subtotal: item.subtotal,
        } as Partial<PedidoDetalleEntityORM>);
        await pedidoDetalleRepo.save(detalleEntity);

        const producto = await productoRepo.findOne({ where: { productoId: item.productoId } });
        if (!producto) {
          throw new NotFoundException('Producto no encontrado al descontar stock');
        }

        producto.cantidad = producto.cantidad - item.cantidadSolicitada;
        await productoRepo.save(producto);

        const kardexEntity = kardexRepo.create({
          productoId: item.productoId,
          tipoMovimiento: TipoMovimientoEnum.SALIDA,
          cantidad: item.cantidadSolicitada,
          costoUnitario: item.precioUnitario,
          valorTotal: item.subtotal,
          referenciaId: savedPedido.pedidoId,
          tipoReferencia: TipoReferenciaEnum.VENTA,
        } as Partial<KardexEntityORM>);
        await kardexRepo.save(kardexEntity);
      }

      const pagoRepo = manager.getRepository(PagoEntityORM);
      const pagoEntity = pagoRepo.create({
        pedidoId: savedPedido.pedidoId,
        metodoPago: params.metodoPago,
        monto: params.total,
        estado: EstadoPagoEnum.PENDIENTE,
      } as Partial<PagoEntityORM>);
      await pagoRepo.save(pagoEntity);

      const carritoDetalleRepo = manager.getRepository(CarritoDetalleEntityORM);
      for (const item of params.items) {
        await carritoDetalleRepo.delete({ carritoDetalleId: item.carritoDetalleId });
      }

      const carritoRepo = manager.getRepository(CarritoEntityORM);
      const carritoEntity = await carritoRepo.findOne({ where: { carritoId: params.carritoId } });
      if (carritoEntity) {
        carritoEntity.updatedAt = new Date();
        await carritoRepo.save(carritoEntity);
      }

      return { pedidoId: savedPedido.pedidoId, total: params.total, numeroPedidoUsuario };
    });

    return result;
  }
}