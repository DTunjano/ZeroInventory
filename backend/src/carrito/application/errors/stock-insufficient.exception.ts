import { ConflictException } from '@nestjs/common';

export type StockInsufficientProduct = {
  nombre: string;
  stockDisponible: number;
  cantidadSolicitada: number;
};

export class StockInsufficientException extends ConflictException {
  constructor(productos: StockInsufficientProduct[]) {
    super({
      error: 'STOCK_INSUFFICIENT',
      message: 'Algunos productos no tienen stock suficiente',
      productos,
    });
  }
}