import { Injectable } from '@nestjs/common';
import { UsuarioRolRepository } from '../../domain/repository/usuario-rol.repository';
import { UsuarioRol } from '../../domain/entity/usuario-rol.entity';

@Injectable()
export class GetUsuarioRolByIdUseCase {
  constructor(private readonly usuarioRolRepo: UsuarioRolRepository) {}

  async ejecutar(usuarioRolId: number): Promise<UsuarioRol | null> {
    return this.usuarioRolRepo.getById(usuarioRolId);
  }
}
