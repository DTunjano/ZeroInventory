import { Injectable } from '@nestjs/common';
import { AjusteInventarioRepository } from '../../domain/repository/ajuste-inventario.repository';
import { AjusteInventario } from '../../domain/entity/ajuste-inventario.entity';

@Injectable()
export class CreateAjusteInventarioUseCase {
  constructor(
    private readonly ajusteInventarioRepo: AjusteInventarioRepository,
  ) {}

  async ejecutar(data: {
    productoId: number;
    usuarioId: number;
    cantidad: number;
    motivo: string;
  }): Promise<AjusteInventario> {
    const ajuste = new AjusteInventario(
      0,
      data.productoId,
      data.usuarioId,
      data.cantidad,
      data.motivo,
      new Date(),
    );
    return this.ajusteInventarioRepo.create(ajuste);
  }
}
