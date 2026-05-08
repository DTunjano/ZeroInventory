import { Injectable, NotFoundException } from '@nestjs/common';
import { UsuarioRepository } from '../../domain/repository/usuario.repository';

@Injectable()
export class DeleteUsuarioUseCase {
  constructor(private readonly usuarioRepo: UsuarioRepository) {}

  async ejecutar(id: number): Promise<void> {
    const deleted = await this.usuarioRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
