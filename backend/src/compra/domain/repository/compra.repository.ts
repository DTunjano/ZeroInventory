import { FilterCompraDTO } from '../../application/dto/filters-compra-dto';
import { Compra } from '../entity/compra.entity';

export abstract class CompraRepository {
  abstract create(compra: Compra): Promise<Compra>;
  abstract getById(compraId: number): Promise<Compra | null>;
  abstract getByProveedorId(proveedorId: number): Promise<Compra[]>;
  abstract getByUsuarioId(usuarioId: number): Promise<Compra[]>;
  abstract getAll(filters?: FilterCompraDTO): Promise<{
    data: Compra[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract update(compra: Compra): Promise<Compra>;
  abstract delete(compraId: number): Promise<boolean>;
}
