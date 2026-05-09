import { Injectable } from '@nestjs/common';
import { PagoRepository } from '../../domain/repository/pago.repository';

@Injectable()
export class DeletePagoUseCase {
  constructor(private readonly pagoRepo: PagoRepository) {}

  async ejecutar(pagoId: number): Promise<boolean> {
    return this.pagoRepo.delete(pagoId);
  }
}
