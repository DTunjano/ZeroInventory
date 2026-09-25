import { Injectable } from '@nestjs/common';
import { RolRepository } from '../../domain/repository/rol.repository';
import { Rol, RolNombreEnum } from '../../domain/entity/rol.entity';

@Injectable()
export class UpdateRolUseCase {
  constructor(private readonly rolRepo: RolRepository) {}

  async ejecutar(
    rolId: number,
    data: {
      nombre?: RolNombreEnum;
    },
  ): Promise<Rol> {
    const rol = await this.rolRepo.getById(rolId);
    if (!rol) {
      throw new Error('Rol no encontrado');
    }

    const updated = new Rol(rol.rolId, data.nombre ?? rol.nombre);
    return this.rolRepo.update(updated);
  }
}
