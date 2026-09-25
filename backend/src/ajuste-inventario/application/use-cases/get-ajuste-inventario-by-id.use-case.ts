import { Injectable } from '@nestjs/common';
import { AjusteInventarioRepository } from '../../domain/repository/ajuste-inventario.repository';
import { AjusteInventario } from '../../domain/entity/ajuste-inventario.entity';

@Injectable()
export class GetAjusteInventarioByIdUseCase {
  constructor(
    private readonly ajusteInventarioRepo: AjusteInventarioRepository,
  ) {}

  async ejecutar(id: number): Promise<AjusteInventario | null> {
    return this.ajusteInventarioRepo.getById(id);
  }
}
