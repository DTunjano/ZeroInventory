import { Injectable, NotFoundException } from '@nestjs/common';
import { CarritoRepository } from '../../domain/repository/carrito.repository';
import { CarritoDetalleRepository } from '../../../carrito-detalle/domain/repository/carrito-detalle.repository';
import { GetOpenCartByUsuarioUseCase, OpenCartView } from './get-open-cart-by-usuario.use-case';

@Injectable()
export class RemoveProductFromCartUseCase {
  constructor(
    private readonly carritoRepo: CarritoRepository,
    private readonly carritoDetalleRepo: CarritoDetalleRepository,
    private readonly getOpenCartByUsuarioUseCase: GetOpenCartByUsuarioUseCase,
  ) {}

  async ejecutar(params: {
    usuarioId: number;
    carritoDetalleId: number;
  }): Promise<OpenCartView> {
    const carrito = await this.carritoRepo.getOpenCartByUsuarioId(params.usuarioId);
    if (!carrito) {
      throw new NotFoundException('No hay carrito abierto');
    }

    const detalle = await this.carritoDetalleRepo.getById(params.carritoDetalleId);
    if (!detalle || detalle.carritoId !== carrito.carritoId) {
      throw new NotFoundException('Producto no encontrado en el carrito');
    }

    await this.carritoDetalleRepo.delete(detalle.carritoDetalleId);

    return this.getOpenCartByUsuarioUseCase.ejecutar(params.usuarioId);
  }
}