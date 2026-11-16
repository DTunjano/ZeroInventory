import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  Carrito,
  EstadoCarritoEnum,
} from '../../domain/entity/carrito.entity';
import { CarritoRepository } from '../../domain/repository/carrito.repository';
import { CarritoDetalle } from '../../../carrito-detalle/domain/entity/carrito-detalle.entity';
import { CarritoDetalleRepository } from '../../../carrito-detalle/domain/repository/carrito-detalle.repository';
import { ProductoRepository } from '../../../producto/domain/repository/producto.repository';
import { GetOpenCartByUsuarioUseCase, OpenCartView } from './get-open-cart-by-usuario.use-case';

@Injectable()
export class AddItemToCartUseCase {
  constructor(
    private readonly carritoRepo: CarritoRepository,
    private readonly carritoDetalleRepo: CarritoDetalleRepository,
    private readonly productoRepo: ProductoRepository,
    private readonly getOpenCartByUsuarioUseCase: GetOpenCartByUsuarioUseCase,
  ) {}

  async ejecutar(params: {
    usuarioId: number;
    productoId: number;
    cantidad: number;
  }): Promise<OpenCartView> {
    if (params.cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    const producto = await this.productoRepo.getById(params.productoId);
    if (!producto || !producto.isActive) {
      throw new NotFoundException('Producto no encontrado');
    }

    let carrito = await this.carritoRepo.getOpenCartByUsuarioId(params.usuarioId);
    if (!carrito) {
      carrito = await this.carritoRepo.create(
        new Carrito(
          0,
          params.usuarioId,
          EstadoCarritoEnum.ABIERTO,
          new Date(),
          new Date(),
        ),
      );
    }

    const existente = await this.carritoDetalleRepo.getByCarritoIdAndProductoId(
      carrito.carritoId,
      params.productoId,
    );

    const nuevaCantidad = (existente?.cantidad ?? 0) + params.cantidad;
    if (existente) {
      await this.carritoDetalleRepo.update(
        new CarritoDetalle(
          existente.carritoDetalleId,
          existente.carritoId,
          existente.productoId,
          nuevaCantidad,
          existente.createdAt,
          new Date(),
        ),
      );
    } else {
      await this.carritoDetalleRepo.create(
        new CarritoDetalle(
          0,
          carrito.carritoId,
          params.productoId,
          params.cantidad,
          new Date(),
          new Date(),
        ),
      );
    }

    return this.getOpenCartByUsuarioUseCase.ejecutar(params.usuarioId);
  }
}
