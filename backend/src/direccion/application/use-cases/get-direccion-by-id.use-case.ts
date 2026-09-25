import { Injectable } from '@nestjs/common';
import { DireccionRepository } from '../../domain/repository/direccion.repository';
import { Direccion } from '../../domain/entity/direccion.entity';

@Injectable()
export class GetDireccionByIdUseCase {
  constructor(private readonly direccionRepo: DireccionRepository) {}

  async ejecutar(id: number): Promise<Direccion | null> {
    return this.direccionRepo.getById(id);
  }
}
