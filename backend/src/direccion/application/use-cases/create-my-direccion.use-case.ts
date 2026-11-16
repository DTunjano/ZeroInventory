import { Injectable, NotFoundException } from '@nestjs/common'

import { ClienteRepository } from '../../../cliente/domain/repository/cliente.repository'
import { Direccion } from '../../domain/entity/direccion.entity'
import { DireccionRepository } from '../../domain/repository/direccion.repository'
import { CreateMyDireccionDTO } from '../dto/create-my-direccion.dto'

@Injectable()
export class CreateMyDireccionUseCase {
  constructor(
    private readonly clienteRepo: ClienteRepository,
    private readonly direccionRepo: DireccionRepository,
  ) {}

  async ejecutar(usuarioId: number, data: CreateMyDireccionDTO): Promise<Direccion> {
    const cliente = await this.clienteRepo.getByUsuarioId(usuarioId)
    if (!cliente) {
      throw new NotFoundException('El usuario no tiene un cliente asociado')
    }

    const direccion = new Direccion(
      0,
      cliente.clienteId,
      null,
      data.lineaDir,
      data.barrio,
      data.codigoPostal ?? null,
      data.infoAdiccional ?? null,
      data.esPredeterminada ?? false,
    )

    return this.direccionRepo.create(direccion)
  }
}
