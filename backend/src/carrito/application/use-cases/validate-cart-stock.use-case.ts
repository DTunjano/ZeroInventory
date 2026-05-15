import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CarritoDetalleRepository } from '../../../carrito-detalle/domain/repository/carrito-detalle.repository';
import { ProductoRepository } from '../../../producto/domain/repository/producto.repository';
import { StockInsufficientException, type StockInsufficientProduct } from '../errors/stock-insufficient.exception';

export type ValidatedCartStockItem = {
  carritoDetalleId: number;
  productoId: number;
  productoNombre: string;
  cantidadSolicitada: number;
  stockDisponible: number;
  precioUnitario: number;
  subtotal: number;
};

export type ValidateCartStockResult = {
  carritoId: number;
  total: number;
  items: ValidatedCartStockItem[];
};

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number.parseFloat(value);
  return Number(value);
}

@Injectable()
export class ValidateCartStockUseCase {
  constructor(
    private readonly carritoDetalleRepo: CarritoDetalleRepository,
    private readonly productoRepo: ProductoRepository,
  ) {}

  async ejecutar(carritoId: number): Promise<ValidateCartStockResult> {
    const detalles = (await this.carritoDetalleRepo.getByCarritoId(carritoId)) ?? [];
    if (detalles.length === 0) {
      throw new ConflictException('El carrito está vacío');
    }

    const productoIds = [...new Set(detalles.map((detalle) => detalle.productoId))];
    const productos = await this.productoRepo.getByIds(productoIds);
    const productosById = new Map(productos.map((producto) => [producto.productoId, producto]));

    const stockErrors: StockInsufficientProduct[] = [];
    const items: ValidatedCartStockItem[] = [];
    let total = 0;

    for (const detalle of detalles) {
      const producto = productosById.get(detalle.productoId);
      if (!producto || !producto.isActive) {
        throw new NotFoundException(`Producto ${detalle.productoId} no disponible`);
      }

      const precioUnitario = toNumber(producto.precio);
      const subtotal = precioUnitario * detalle.cantidad;

      if (detalle.cantidad > producto.cantidad) {
        stockErrors.push({
          nombre: producto.nombre,
          stockDisponible: producto.cantidad,
          cantidadSolicitada: detalle.cantidad,
        });
      }

      total += subtotal;
      items.push({
        carritoDetalleId: detalle.carritoDetalleId,
        productoId: detalle.productoId,
        productoNombre: producto.nombre,
        cantidadSolicitada: detalle.cantidad,
        stockDisponible: producto.cantidad,
        precioUnitario,
        subtotal,
      });
    }

    if (stockErrors.length > 0) {
      throw new StockInsufficientException(stockErrors);
    }

    return {
      carritoId,
      total,
      items,
    };
  }
}