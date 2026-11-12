import { Injectable } from '@nestjs/common';
import { AjusteInventarioRepository } from '../../domain/repository/ajuste-inventario.repository';
import { AjusteInventario } from '../../domain/entity/ajuste-inventario.entity';
import { FilterAjusteInventarioDTO } from '../dto/filters-ajuste-inventario-dto';

@Injectable()
export class GetAllAjustesInventarioUseCase {
  constructor(
    private readonly ajusteInventarioRepo: AjusteInventarioRepository,
  ) {}

  async ejecutar(filters?: FilterAjusteInventarioDTO): Promise<{
    data: AjusteInventario[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.ajusteInventarioRepo.getAll(filters);
  }
}
