import { Injectable } from '@nestjs/common';
import { UsuarioRolRepository } from '../../domain/repository/usuario-rol.repository';
import { UsuarioRol } from '../../domain/entity/usuario-rol.entity';

@Injectable()
export class UpdateUsuarioRolUseCase {
  constructor(private readonly usuarioRolRepo: UsuarioRolRepository) {}

  async ejecutar(
    usuarioRolId: number,
    data: {
      rolId?: number;
    },
  ): Promise<UsuarioRol> {
    const usuarioRol = await this.usuarioRolRepo.getById(usuarioRolId);
    if (!usuarioRol) {
      throw new Error('Usuario rol no encontrado');
    }

    const updated = new UsuarioRol(
      usuarioRol.usuarioRolId,
      usuarioRol.usuarioId,
      data.rolId ?? usuarioRol.rolId,
    );
    return this.usuarioRolRepo.update(updated);
  }
}
