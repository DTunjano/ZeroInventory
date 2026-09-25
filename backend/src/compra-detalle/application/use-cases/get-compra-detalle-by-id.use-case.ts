import { Injectable } from '@nestjs/common';
import { CompraDetalleRepository } from '../../domain/repository/compra-detalle.repository';
import { CompraDetalle } from '../../domain/entity/compra-detalle.entity';

@Injectable()
export class GetCompraDetalleByIdUseCase {
  constructor(private readonly compraDetalleRepo: CompraDetalleRepository) {}

  async ejecutar(id: number): Promise<CompraDetalle | null> {
    return this.compraDetalleRepo.getById(id);
  }
}
