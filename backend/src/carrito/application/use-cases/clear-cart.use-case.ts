import { Injectable } from '@nestjs/common';
import { CarritoRepository } from '../../domain/repository/carrito.repository';
import { CarritoDetalleRepository } from '../../../carrito-detalle/domain/repository/carrito-detalle.repository';
import { GetOpenCartByUsuarioUseCase, OpenCartView } from './get-open-cart-by-usuario.use-case';

@Injectable()
export class ClearCartUseCase {
  constructor(
    private readonly carritoRepo: CarritoRepository,
    private readonly carritoDetalleRepo: CarritoDetalleRepository,
    private readonly getOpenCartByUsuarioUseCase: GetOpenCartByUsuarioUseCase,
  ) {}

  async ejecutar(usuarioId: number): Promise<OpenCartView> {
    const carrito = await this.carritoRepo.getOpenCartByUsuarioId(usuarioId);
    if (!carrito) {
      return { carritoId: 0, usuarioId, items: [], total: 0 };
    }

    const detalles = (await this.carritoDetalleRepo.getByCarritoId(carrito.carritoId)) ?? [];
    for (const detalle of detalles) {
      await this.carritoDetalleRepo.delete(detalle.carritoDetalleId);
    }

    return this.getOpenCartByUsuarioUseCase.ejecutar(usuarioId);
  }
}