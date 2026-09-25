import { Injectable, NotFoundException } from '@nestjs/common';
import { CompraDetalleRepository } from '../../domain/repository/compra-detalle.repository';

@Injectable()
export class DeleteCompraDetalleUseCase {
  constructor(private readonly compraDetalleRepo: CompraDetalleRepository) {}

  async ejecutar(id: number): Promise<void> {
    const deleted = await this.compraDetalleRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('Detalle de compra no encontrado');
    }
  }
}
