import { Injectable } from '@nestjs/common';
import { DireccionRepository } from '../../domain/repository/direccion.repository';
import { Direccion } from '../../domain/entity/direccion.entity';

@Injectable()
export class CreateDireccionUseCase {
  constructor(private readonly direccionRepo: DireccionRepository) {}

  async ejecutar(data: {
    clienteId: number;
    lineaDir: string;
    barrio: string;
    codigoPostal: string | null;
    infoAdiccional: string | null;
  }): Promise<Direccion> {
    const direccion = new Direccion(
      0,
      data.clienteId,
      data.lineaDir,
      data.barrio,
      data.codigoPostal ?? null,
      data.infoAdiccional ?? null,
    );
    return this.direccionRepo.create(direccion);
  }
}
