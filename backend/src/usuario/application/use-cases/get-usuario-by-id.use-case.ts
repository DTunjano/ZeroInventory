import { Injectable } from '@nestjs/common';
import { UsuarioRepository } from '../../domain/repository/usuario.repository';
import { Usuario } from '../../domain/entity/usuario.entity';

@Injectable()
export class GetUsuarioByIdUseCase {
  constructor(private readonly usuarioRepo: UsuarioRepository) {}

  async ejecutar(id: number): Promise<Usuario | null> {
    return this.usuarioRepo.getById(id);
  }
}
