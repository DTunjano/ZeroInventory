import { Injectable } from '@nestjs/common';
import { PagoRepository } from '../../domain/repository/pago.repository';
import {
  EstadoPagoEnum,
  MetodoPagoEnum,
  Pago,
} from '../../domain/entity/pago.entity';

@Injectable()
export class UpdatePagoUseCase {
  constructor(private readonly pagoRepo: PagoRepository) {}

  async ejecutar(
    pagoId: number,
    data: {
      metodoPago?: MetodoPagoEnum;
      monto?: number;
      estado?: EstadoPagoEnum;
    },
  ): Promise<Pago> {
    const pago = await this.pagoRepo.getById(pagoId);
    if (!pago) {
      throw new Error('Pago no encontrado');
    }

    const updated = new Pago(
      pago.pagoId,
      pago.pedidoId,
      data.metodoPago ?? pago.metodoPago,
      data.monto ?? pago.monto,
      data.estado ?? pago.estado,
      pago.fechaPago,
    );
    return this.pagoRepo.update(updated);
  }
}
