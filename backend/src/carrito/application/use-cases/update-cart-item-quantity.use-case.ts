import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CarritoRepository } from '../../domain/repository/carrito.repository';
import { CarritoDetalleRepository } from '../../../carrito-detalle/domain/repository/carrito-detalle.repository';
import { ProductoRepository } from '../../../producto/domain/repository/producto.repository';
import { GetOpenCartByUsuarioUseCase, OpenCartView } from './get-open-cart-by-usuario.use-case';

@Injectable()
export class UpdateCartItemQuantityUseCase {
  constructor(
    private readonly carritoRepo: CarritoRepository,
    private readonly carritoDetalleRepo: CarritoDetalleRepository,
    private readonly productoRepo: ProductoRepository,
    private readonly getOpenCartByUsuarioUseCase: GetOpenCartByUsuarioUseCase,
  ) {}

  async ejecutar(params: {
    usuarioId: number;
    carritoDetalleId: number;
    cantidad: number;
  }): Promise<OpenCartView> {
    if (params.cantidad < 1) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    const carrito = await this.carritoRepo.getOpenCartByUsuarioId(params.usuarioId);
    if (!carrito) {
      throw new NotFoundException('No hay carrito abierto');
    }

    const detalle = await this.carritoDetalleRepo.getById(params.carritoDetalleId);
    if (!detalle || detalle.carritoId !== carrito.carritoId) {
      throw new NotFoundException('Producto no encontrado en el carrito');
    }

    const producto = await this.productoRepo.getById(detalle.productoId);
    if (!producto || !producto.isActive) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (params.cantidad > producto.cantidad) {
      throw new BadRequestException('Stock insuficiente');
    }

    await this.carritoDetalleRepo.update({
      ...detalle,
      cantidad: params.cantidad,
      updatedAt: new Date(),
    });

    return this.getOpenCartByUsuarioUseCase.ejecutar(params.usuarioId);
  }
}