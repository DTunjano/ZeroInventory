import { Injectable, NotFoundException } from '@nestjs/common';
import { AjusteInventarioRepository } from '../../domain/repository/ajuste-inventario.repository';

@Injectable()
export class DeleteAjusteInventarioUseCase {
  constructor(
    private readonly ajusteInventarioRepo: AjusteInventarioRepository,
  ) {}

  async ejecutar(id: number): Promise<void> {
    const deleted = await this.ajusteInventarioRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('Ajuste de inventario no encontrado');
    }
  }
}
