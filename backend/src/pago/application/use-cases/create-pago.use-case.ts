import { Injectable } from '@nestjs/common';
import { PagoRepository } from '../../domain/repository/pago.repository';
import {
  EstadoPagoEnum,
  MetodoPagoEnum,
  Pago,
} from '../../domain/entity/pago.entity';

@Injectable()
export class CreatePagoUseCase {
  constructor(private readonly pagoRepo: PagoRepository) {}

  async ejecutar(data: {
    pedidoId: number;
    metodoPago: MetodoPagoEnum;
    monto: number;
    estado: EstadoPagoEnum;
  }): Promise<Pago> {
    const pago = new Pago(
      0,
      data.pedidoId,
      data.metodoPago,
      data.monto,
      data.estado,
      new Date(),
    );
    return this.pagoRepo.create(pago);
  }
}
