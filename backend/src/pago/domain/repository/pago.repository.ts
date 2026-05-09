import { FiltersPagoDTO } from '../../application/dto/filters-pago-dto';
import { Pago } from '../entity/pago.entity';

export abstract class PagoRepository {
  abstract create(pago: Pago): Promise<Pago>;
  abstract getById(pagoId: number): Promise<Pago | null>;
  abstract update(pago: Pago): Promise<Pago>;
  abstract delete(pagoId: number): Promise<boolean>;
  abstract getAll(filters?: FiltersPagoDTO): Promise<{
    data: Pago[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
