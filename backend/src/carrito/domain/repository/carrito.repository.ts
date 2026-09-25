import { FiltersCarritoDTO } from '../../application/dto/filters-carrito-dto';
import { Carrito } from '../entity/carrito.entity';

export abstract class CarritoRepository {
  abstract create(carrito: Carrito): Promise<Carrito>;
  abstract getById(carritoId: number): Promise<Carrito | null>;
  abstract getOpenCartByUsuarioId(usuarioId: number): Promise<Carrito | null>;
  abstract getAll(filters?: FiltersCarritoDTO): Promise<{
    data: Carrito[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract update(carrito: Carrito): Promise<Carrito>;
  abstract delete(carritoId: number): Promise<boolean>;
}
