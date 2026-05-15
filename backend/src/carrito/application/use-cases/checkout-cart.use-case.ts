import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CarritoRepository } from '../../domain/repository/carrito.repository';
import { ClienteRepository } from '../../../cliente/domain/repository/cliente.repository';
import { DireccionRepository } from '../../../direccion/domain/repository/direccion.repository';
import { MetodoPagoEnum } from '../../../pago/domain/entity/pago.entity';
import { CreateOrderUseCase } from './create-order.use-case';
import { ValidateCartStockUseCase } from './validate-cart-stock.use-case';

@Injectable()
export class CheckoutCartUseCase {
  constructor(
    private readonly carritoRepo: CarritoRepository,
    private readonly clienteRepo: ClienteRepository,
    private readonly direccionRepo: DireccionRepository,
    private readonly validateCartStockUseCase: ValidateCartStockUseCase,
    private readonly createOrderUseCase: CreateOrderUseCase,
  ) {}

  async ejecutar(params: {
    usuarioId: number;
    direccionId: number;
    metodoPago: MetodoPagoEnum;
  }): Promise<{ pedidoId: number; total: number; numeroPedidoUsuario: number }> {
    const carrito = await this.carritoRepo.getOpenCartByUsuarioId(params.usuarioId);
    if (!carrito) {
      throw new ConflictException('No hay carrito abierto');
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
      throw new ConflictException('La dirección no pertenece al cliente');
    }

    const validation = await this.validateCartStockUseCase.ejecutar(carrito.carritoId);

    return this.createOrderUseCase.ejecutar({
      clienteId: cliente.clienteId,
      carritoId: carrito.carritoId,
      direccionId: params.direccionId,
      metodoPago: params.metodoPago,
      total: validation.total,
      items: validation.items,
    });
  }
}
