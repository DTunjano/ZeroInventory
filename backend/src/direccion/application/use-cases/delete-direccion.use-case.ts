import { Injectable, NotFoundException } from '@nestjs/common';
import { DireccionRepository } from '../../domain/repository/direccion.repository';

@Injectable()
export class DeleteDireccionUseCase {
  constructor(private readonly direccionRepo: DireccionRepository) {}

  async ejecutar(id: number): Promise<void> {
    const deleted = await this.direccionRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('Dirección no encontrada');
    }
  }
}
