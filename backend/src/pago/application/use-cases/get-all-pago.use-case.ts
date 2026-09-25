import { Injectable } from '@nestjs/common';
import { PagoRepository } from '../../domain/repository/pago.repository';
import { FiltersPagoDTO } from '../dto/filters-pago-dto';
import { Pago } from '../../domain/entity/pago.entity';

@Injectable()
export class GetAllPagoUseCase {
  constructor(private readonly pagoRepo: PagoRepository) {}

  async ejecutar(filters?: FiltersPagoDTO): Promise<{
    data: Pago[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.pagoRepo.getAll(filters);
  }
}
