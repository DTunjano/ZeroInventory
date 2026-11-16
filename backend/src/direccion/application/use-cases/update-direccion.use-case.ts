import { Injectable, NotFoundException } from '@nestjs/common'

import { Direccion } from '../../domain/entity/direccion.entity'
import { DireccionRepository } from '../../domain/repository/direccion.repository'
import { UpdateDireccionDTO } from '../dto/update-direccion-dto'

@Injectable()
export class UpdateDireccionUseCase {
  constructor(private readonly direccionRepo: DireccionRepository) {}

  async ejecutar(direccionId: number, data: UpdateDireccionDTO): Promise<Direccion> {
    const existing = await this.direccionRepo.getById(direccionId)
    if (!existing) {
      throw new NotFoundException('Dirección no encontrada')
    }

    const direccion = new Direccion(
      direccionId,
      existing.clienteId,
      existing.proveedorId,
      data.lineaDir ?? existing.lineaDir,
      data.barrio ?? existing.barrio,
      data.codigoPostal !== undefined ? data.codigoPostal : existing.codigoPostal,
      data.infoAdiccional !== undefined ? data.infoAdiccional : existing.infoAdiccional,
      data.esPredeterminada !== undefined ? data.esPredeterminada : existing.esPredeterminada,
    )

    return this.direccionRepo.update(direccion)
  }
}
