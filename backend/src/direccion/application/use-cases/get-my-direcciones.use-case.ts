import { Injectable, NotFoundException } from '@nestjs/common'

import { ClienteRepository } from '../../../cliente/domain/repository/cliente.repository'
import { Direccion } from '../../domain/entity/direccion.entity'
import { DireccionRepository } from '../../domain/repository/direccion.repository'

@Injectable()
export class GetMyDireccionesUseCase {
  constructor(
    private readonly clienteRepo: ClienteRepository,
    private readonly direccionRepo: DireccionRepository,
  ) {}

  async ejecutar(usuarioId: number): Promise<Direccion[]> {
    const cliente = await this.clienteRepo.getByUsuarioId(usuarioId)
    if (!cliente) {
      throw new NotFoundException('El usuario no tiene un cliente asociado')
    }

    const result = await this.direccionRepo.getAll({
      clienteId: cliente.clienteId,
      page: 1,
      limit: 100,
    })

    return result.data
  }
}