import { Injectable } from '@nestjs/common';
import { PagoRepository } from '../../domain/repository/pago.repository';
import { Pago } from '../../domain/entity/pago.entity';

@Injectable()
export class GetPagoByIdUseCase {
  constructor(private readonly pagoRepo: PagoRepository) {}

  async ejecutar(pagoId: number): Promise<Pago | null> {
    return this.pagoRepo.getById(pagoId);
  }
}
