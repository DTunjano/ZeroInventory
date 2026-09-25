import { FiltersCarritoDetalleDTO } from '../../application/dto/filters-carrito-detalle-dto';
import { CarritoDetalle } from '../entity/carrito-detalle.entity';

export abstract class CarritoDetalleRepository {
  abstract create(carritoDetalle: CarritoDetalle): Promise<CarritoDetalle>;
  abstract getById(carritoDetalleId: number): Promise<CarritoDetalle | null>;
  abstract getByCarritoId(carritoId: number): Promise<CarritoDetalle[] | null>;
  abstract getByCarritoIdAndProductoId(
    carritoId: number,
    productoId: number,
  ): Promise<CarritoDetalle | null>;
  abstract getAll(filters?: FiltersCarritoDetalleDTO): Promise<{
    data: CarritoDetalle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract update(carritoDetalle: CarritoDetalle): Promise<CarritoDetalle>;
  abstract delete(carritoDetalleId: number): Promise<boolean>;
}
