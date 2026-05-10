import { Injectable, NotFoundException } from '@nestjs/common';
import { CompraRepository } from '../../domain/repository/compra.repository';

@Injectable()
export class DeleteCompraUseCase {
  constructor(private readonly compraRepo: CompraRepository) {}

  async ejecutar(id: number): Promise<void> {
    const deleted = await this.compraRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('Compra no encontrada');
    }
  }
}
