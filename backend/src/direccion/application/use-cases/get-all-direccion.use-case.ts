import { Injectable } from '@nestjs/common';
import { DireccionRepository } from '../../domain/repository/direccion.repository';
import { Direccion } from '../../domain/entity/direccion.entity';
import { FiltersDireccionDTO } from '../dto/filters-direccion-dto';

@Injectable()
export class GetAllDireccionesUseCase {
  constructor(private readonly direccionRepo: DireccionRepository) {}

  async ejecutar(filters?: FiltersDireccionDTO): Promise<{
    data: Direccion[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.direccionRepo.getAll(filters);
  }
}
