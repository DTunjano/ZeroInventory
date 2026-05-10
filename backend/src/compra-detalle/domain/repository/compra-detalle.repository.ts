import { FilterCompraDetalleDTO } from '../../application/dto/filters-compra-detalle-dto';
import { CompraDetalle } from '../entity/compra-detalle.entity';

export abstract class CompraDetalleRepository {
  abstract create(compraDetalle: CompraDetalle): Promise<CompraDetalle>;
  abstract getById(compraDetalleId: number): Promise<CompraDetalle | null>;
  abstract getByCompraId(compraId: number): Promise<CompraDetalle[]>;
  abstract getByProductoId(productoId: number): Promise<CompraDetalle[]>;
  abstract getAll(filters?: FilterCompraDetalleDTO): Promise<{
    data: CompraDetalle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract update(compraDetalle: CompraDetalle): Promise<CompraDetalle>;
  abstract delete(compraDetalleId: number): Promise<boolean>;
}
