import { Injectable } from '@nestjs/common';
import { UsuarioRolRepository } from '../../domain/repository/usuario-rol.repository';

@Injectable()
export class DeleteUsuarioRolUseCase {
  constructor(private readonly usuarioRolRepo: UsuarioRolRepository) {}

  async ejecutar(usuarioRolId: number): Promise<boolean> {
    return this.usuarioRolRepo.delete(usuarioRolId);
  }
}
