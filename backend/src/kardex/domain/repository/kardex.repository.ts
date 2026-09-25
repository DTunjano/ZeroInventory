import { FilterKardexDTO } from '../../application/dto/filters-kardex-dto';
import { Kardex } from '../entity/kardex.entity';

export abstract class KardexRepository {
  abstract create(kardex: Kardex): Promise<Kardex>;
  abstract getById(id: number): Promise<Kardex | null>;
  abstract getByProductoId(productoId: number): Promise<Kardex[]>;
  abstract getByReferenciaId(referenciaId: number): Promise<Kardex[]>;
  abstract getAll(filters?: FilterKardexDTO): Promise<{
    data: Kardex[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract update(Kardex: Kardex): Promise<Kardex>;
  abstract delete(kardexId: number): Promise<boolean>;
}
