import { Injectable, NotFoundException } from '@nestjs/common';
import { AjusteInventarioRepository } from '../../domain/repository/ajuste-inventario.repository';
import { AjusteInventario } from '../../domain/entity/ajuste-inventario.entity';

@Injectable()
export class UpdateAjusteInventarioUseCase {
  constructor(
    private readonly ajusteInventarioRepo: AjusteInventarioRepository,
  ) {}

  async ejecutar(
    ajusteInventarioId: number,
    cambios: {
      productoId?: number;
      usuarioId?: number;
      cantidad?: number;
      motivo?: string;
    },
  ): Promise<AjusteInventario> {
    const actual = await this.ajusteInventarioRepo.getById(ajusteInventarioId);
    if (!actual) {
      throw new NotFoundException('Ajuste de inventario no encontrado');
    }

    const ajuste = new AjusteInventario(
      actual.ajusteInventarioId,
      cambios.productoId ?? actual.productoId,
      cambios.usuarioId ?? actual.usuarioId,
      cambios.cantidad ?? actual.cantidad,
      cambios.motivo ?? actual.motivo,
      actual.fecha,
    );
    return this.ajusteInventarioRepo.update(ajuste);
  }
}
