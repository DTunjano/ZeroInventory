import { Injectable } from '@nestjs/common';
import { UsuarioRolRepository } from '../../domain/repository/usuario-rol.repository';
import { UsuarioRol } from '../../domain/entity/usuario-rol.entity';

@Injectable()
export class CreateUsuarioRolUseCase {
  constructor(private readonly usuarioRolRepo: UsuarioRolRepository) {}

  async ejecutar(data: {
    usuarioId: number;
    rolId: number;
  }): Promise<UsuarioRol> {
    const usuarioRol = new UsuarioRol(0, data.usuarioId, data.rolId);
    return this.usuarioRolRepo.create(usuarioRol);
  }
}
