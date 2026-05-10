import { Injectable, NotFoundException } from '@nestjs/common';
import { DireccionRepository } from '../../domain/repository/direccion.repository';
import { Direccion } from '../../domain/entity/direccion.entity';

@Injectable()
export class UpdateDireccionUseCase {
  constructor(private readonly direccionRepo: DireccionRepository) {}

  async ejecutar(
    direccionId: number,
    cambios: {
      lineaDir?: string;
      barrio?: string;
      codigoPostal?: string | null;
      infoAdiccional?: string | null;
    },
  ): Promise<Direccion> {
    const actual = await this.direccionRepo.getById(direccionId);
    if (!actual) {
      throw new NotFoundException('Dirección no encontrada');
    }

    const direccion = new Direccion(
      actual.direccionId,
      actual.clienteId,
      cambios.lineaDir ?? actual.lineaDir,
      cambios.barrio ?? actual.barrio,
      cambios.codigoPostal ?? actual.codigoPostal,
      cambios.infoAdiccional ?? actual.infoAdiccional,
    );
    return this.direccionRepo.update(direccion);
  }
}
