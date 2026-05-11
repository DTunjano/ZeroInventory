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

    const pedido = await this.pedidoRepo.create(
      new Pedido(
        0,
        cliente.clienteId,
        params.direccionId,
        EstadoPedidoEnum.CONFIRMADO,
        total,
        new Date(),
      ),
    );

    for (const l of lineas) {
      await this.pedidoDetalleRepo.create(
        new PedidoDetalle(
          0,
          pedido.pedidoId,
          l.productoId,
          l.cantidad,
          l.precioUnitario,
          l.subtotal,
        ),
      );

      const producto = await this.productoRepo.getById(l.productoId);
      if (!producto) {
        throw new NotFoundException('Producto no encontrado al descontar stock');
      }
      producto.cantidad = producto.cantidad - l.cantidad;
      if (producto.cantidad < 0) {
        throw new BadRequestException('Stock quedó negativo');
      }
      await this.productoRepo.update(producto);
    }

    await this.pagoRepo.create(
      new Pago(
        0,
        pedido.pedidoId,
        params.metodoPago,
        total,
        EstadoPagoEnum.PENDIENTE,
        new Date(),
      ),
    );

    carrito.estado = EstadoCarritoEnum.CERRADO;
    carrito.updatedAt = new Date();
    await this.carritoRepo.update(carrito);

    return { pedidoId: pedido.pedidoId, total };
  }
}
