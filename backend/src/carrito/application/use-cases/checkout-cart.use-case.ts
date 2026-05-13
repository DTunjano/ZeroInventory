import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CarritoRepository } from '../../domain/repository/carrito.repository';
import { CarritoDetalleRepository } from '../../../carrito-detalle/domain/repository/carrito-detalle.repository';
import { ProductoRepository } from '../../../producto/domain/repository/producto.repository';
import { ClienteRepository } from '../../../cliente/domain/repository/cliente.repository';
import { DireccionRepository } from '../../../direccion/domain/repository/direccion.repository';
import { PedidoRepository } from '../../../pedido/domain/repository/pedido.repository';
import { PedidoDetalleRepository } from '../../../pedido-detalle/domain/repository/pedido-detalle.repository';
import { PagoRepository } from '../../../pago/domain/repository/pago.repository';
import { EstadoCarritoEnum } from '../../domain/entity/carrito.entity';
import { EstadoPedidoEnum, Pedido } from '../../../pedido/domain/entity/pedido.entity';
import { PedidoDetalle } from '../../../pedido-detalle/domain/entity/pedido-detalle.entity';
import {
  EstadoPagoEnum,
  MetodoPagoEnum,
  Pago,
} from '../../../pago/domain/entity/pago.entity';
import { DataSource } from 'typeorm';
import { PedidoEntityORM } from '../../../pedido/infrastructure/persistence/pedido.orm-entity';
import { PedidoDetalleEntityORM } from '../../../pedido-detalle/infrastructure/persistence/pedido-detalle.orm-entity';
import { PagoEntityORM } from '../../../pago/infrastructure/persistence/pago.orm-entity';
import { ProductoEntityORM } from '../../../producto/infrastructure/persistence/producto.orm-entity';
import { CarritoDetalleEntityORM } from '../../../carrito-detalle/infrastructure/persistence/carrito-detalle.orm-entity';
import { CarritoEntityORM } from '../../../carrito/infrastructure/persistence/carrito.orm-entity';
import { KardexEntityORM, TipoMovimientoEnum, TipoReferenciaEnum } from '../../../entities/kardex.orm-entity';

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number.parseFloat(value);
  return Number(value);
}

@Injectable()
export class CheckoutCartUseCase {
  constructor(
    private readonly carritoRepo: CarritoRepository,
    private readonly carritoDetalleRepo: CarritoDetalleRepository,
    private readonly productoRepo: ProductoRepository,
    private readonly clienteRepo: ClienteRepository,
    private readonly direccionRepo: DireccionRepository,
    private readonly pedidoRepo: PedidoRepository,
    private readonly pedidoDetalleRepo: PedidoDetalleRepository,
    private readonly pagoRepo: PagoRepository,
    private readonly dataSource: DataSource,
  ) {}

  async ejecutar(params: {
    usuarioId: number;
    direccionId: number;
    metodoPago: MetodoPagoEnum;
  }): Promise<{ pedidoId: number; total: number }> {
    const carrito = await this.carritoRepo.getOpenCartByUsuarioId(params.usuarioId);
    if (!carrito) {
      throw new BadRequestException('No hay carrito abierto');
    }

    const detalles = (await this.carritoDetalleRepo.getByCarritoId(
      carrito.carritoId,
    )) ?? [];
    if (detalles.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const cliente = await this.clienteRepo.getByUsuarioId(params.usuarioId);
    if (!cliente) {
      throw new NotFoundException('No existe un cliente asociado a este usuario');
    }

    const direccion = await this.direccionRepo.getById(params.direccionId);
    if (!direccion) {
      throw new NotFoundException('Dirección no encontrada');
    }
    if (direccion.clienteId !== cliente.clienteId) {
      throw new ForbiddenException('La dirección no pertenece al cliente');
    }

    let total = 0;
    const lineas: Array<{
      productoId: number;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }> = [];

    for (const d of detalles) {
      const producto = await this.productoRepo.getById(d.productoId);
      if (!producto || !producto.isActive) {
        throw new BadRequestException(
          `Producto ${d.productoId} no disponible`,
        );
      }
      if (d.cantidad > producto.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para producto ${d.productoId}`,
        );
      }

      const precioUnitario = toNumber(producto.precio);
      const subtotal = precioUnitario * d.cantidad;
      total += subtotal;
      lineas.push({
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioUnitario,
        subtotal,
      });
    }

    // Execute DB writes in a single transaction to ensure atomicity
    const result = await this.dataSource.transaction(async (manager) => {
      // create pedido
      const pedidoRepo = manager.getRepository(PedidoEntityORM);
      const pedidoEntity = pedidoRepo.create({
        clienteId: cliente.clienteId,
        direccionId: params.direccionId,
        estado: EstadoPedidoEnum.CONFIRMADO,
        total,
      } as Partial<PedidoEntityORM>);
      const savedPedido = await pedidoRepo.save(pedidoEntity);

      // create pedido_detalle lines and decrement stock
      const pedidoDetalleRepo = manager.getRepository(PedidoDetalleEntityORM);
      const productoRepo = manager.getRepository(ProductoEntityORM);
      const kardexRepo = manager.getRepository(KardexEntityORM);

      for (const l of lineas) {
        const detalleEntity = pedidoDetalleRepo.create({
          pedidoId: savedPedido.pedidoId,
          productoId: l.productoId,
          cantidad: l.cantidad,
          precioUnitario: l.precioUnitario,
          subtotal: l.subtotal,
        } as Partial<PedidoDetalleEntityORM>);
        await pedidoDetalleRepo.save(detalleEntity);

        const prod = await productoRepo.findOne({ where: { productoId: l.productoId } });
        if (!prod) {
          throw new NotFoundException('Producto no encontrado al descontar stock');
        }
        prod.cantidad = prod.cantidad - l.cantidad;
        if (prod.cantidad < 0) {
          throw new BadRequestException('Stock quedó negativo');
        }
        await productoRepo.save(prod);

        const kardexEntity = kardexRepo.create({
          productoId: l.productoId,
          tipoMovimiento: TipoMovimientoEnum.SALIDA,
          cantidad: l.cantidad,
          costoUnitario: l.precioUnitario,
          valorTotal: l.subtotal,
          referenciaId: savedPedido.pedidoId,
          tipoReferencia: TipoReferenciaEnum.VENTA,
        } as Partial<KardexEntityORM>);
        await kardexRepo.save(kardexEntity);
      }

      // create pago (PENDIENTE)
      const pagoRepo = manager.getRepository(PagoEntityORM);
      const pagoEntity = pagoRepo.create({
        pedidoId: savedPedido.pedidoId,
        metodoPago: params.metodoPago,
        monto: total,
        estado: EstadoPagoEnum.PENDIENTE,
      } as Partial<PagoEntityORM>);
      await pagoRepo.save(pagoEntity);

      // delete carrito_detalle items
      const carritoDetalleRepo = manager.getRepository(CarritoDetalleEntityORM);
      for (const d of detalles) {
        await carritoDetalleRepo.delete({ carritoDetalleId: d.carritoDetalleId });
      }

      // update carrito timestamp (keep it open)
      const carritoRepo = manager.getRepository(CarritoEntityORM);
      const carritoEntity = await carritoRepo.findOne({ where: { carritoId: carrito.carritoId } });
      if (carritoEntity) {
        carritoEntity.updatedAt = new Date();
        await carritoRepo.save(carritoEntity);
      }

      return { pedidoId: savedPedido.pedidoId, total };
    });

    return result;
  }
}
