import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuarioRepository } from '../../../usuario/domain/repository/usuario.repository';
import { UpdatePasswordDto } from '../dto/update-password.dto';

@Injectable()
export class UpdatePasswordUseCase {
  constructor(
    private readonly usuarioRepo: UsuarioRepository,
  ) {}

  async ejecutar(usuarioId: number, body: UpdatePasswordDto): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = body;

    if (newPassword !== confirmPassword) {
      throw new UnauthorizedException('La nueva contraseña y la confirmación no coinciden');
    }

    if (currentPassword === newPassword) {
      throw new UnauthorizedException('La nueva contraseña debe ser diferente a la actual');
    }

    const usuario = await this.usuarioRepo.getById(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const match = await bcrypt.compare(currentPassword, usuario.password);
    if (!match) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    usuario.password = hashed;
    await this.usuarioRepo.update(usuario);
  }
}
