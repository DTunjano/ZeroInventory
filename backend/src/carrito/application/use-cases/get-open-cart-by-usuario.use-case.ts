import { Injectable, NotFoundException } from '@nestjs/common';
import { CarritoRepository } from '../../domain/repository/carrito.repository';
import { CarritoDetalleRepository } from '../../../carrito-detalle/domain/repository/carrito-detalle.repository';
import { ProductoRepository } from '../../../producto/domain/repository/producto.repository';

export type OpenCartItemView = {
  carritoDetalleId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  productoNombre: string;
  stockDisponible: number;
};

export type OpenCartView = {
  carritoId: number;
  usuarioId: number;
  items: OpenCartItemView[];
  total: number;
};

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number.parseFloat(value);
  return Number(value);
}

@Injectable()
export class GetOpenCartByUsuarioUseCase {
  constructor(
    private readonly carritoRepo: CarritoRepository,
    private readonly carritoDetalleRepo: CarritoDetalleRepository,
    private readonly productoRepo: ProductoRepository,
  ) {}

  async ejecutar(usuarioId: number): Promise<OpenCartView> {
    const carrito = await this.carritoRepo.getOpenCartByUsuarioId(usuarioId);
    if (!carrito) {
      return { carritoId: 0, usuarioId, items: [], total: 0 };
    }

    const detalles = (await this.carritoDetalleRepo.getByCarritoId(
      carrito.carritoId,
    )) ?? [];

    const items: OpenCartItemView[] = [];
    let total = 0;

    for (const d of detalles) {
      const producto = await this.productoRepo.getById(d.productoId);
      if (!producto) {
        throw new NotFoundException(
          `Producto ${d.productoId} no existe (carrito inconsistente)`,
        );
      }

      const precioUnitario = toNumber(producto.precio);
      const subtotal = precioUnitario * d.cantidad;
      total += subtotal;

      items.push({
        carritoDetalleId: d.carritoDetalleId,
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioUnitario,
        subtotal,
        productoNombre: producto.nombre,
        stockDisponible: producto.cantidad,
      });
    }

    return {
      carritoId: carrito.carritoId,
      usuarioId: carrito.usuarioId,
      items,
      total,
    };
  }
}
