import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsuarioRepository } from '../../domain/repository/usuario.repository';
import { Usuario } from '../../domain/entity/usuario.entity';
import * as bcrypt from 'bcrypt';
import { UsuarioAccess } from '../../domain/entity/usuario-access';

@Injectable()
export class UpdateUsuarioUseCase {
  constructor(private readonly usuarioRepo: UsuarioRepository) {}

  async ejecutar(
    usuarioId: number,
    cambios: Partial<UsuarioAccess> & {
      username?: string;
      email?: string | null;
      telefono?: string | null;
      password?: string;
      primerNombre?: string | null;
      segundoNombre?: string | null;
      primerApellido?: string | null;
      segundoApellido?: string | null;
      isActive?: boolean;
    },
  ): Promise<Usuario> {
    const actual = await this.usuarioRepo.getById(usuarioId);
    if (!actual) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (cambios.username && cambios.username !== actual.username) {
      const existingUser = await this.usuarioRepo.getByUsername(
        cambios.username,
      );
      if (existingUser) {
        throw new ConflictException(
          'Ya existe un usuario con ese nombre de usuario',
        );
      }
    }

    if (cambios.email && cambios.email !== actual.email) {
      const existingEmail = await this.usuarioRepo.getByEmail(cambios.email);
      if (existingEmail && existingEmail.usuarioId !== usuarioId) {
        throw new ConflictException(
          'Ya existe un usuario con ese correo electrónico',
        );
      }
    }

    const usuario = new Usuario(
      actual.usuarioId,
      cambios.username ?? actual.username,
      cambios.email !== undefined ? cambios.email : actual.email,
      cambios.telefono !== undefined ? cambios.telefono : actual.telefono,
      cambios.password ? await bcrypt.hash(cambios.password, 10) : actual.password,
      cambios.primerNombre !== undefined ? cambios.primerNombre : actual.primerNombre,
      cambios.segundoNombre !== undefined ? cambios.segundoNombre : actual.segundoNombre,
      cambios.primerApellido !== undefined ? cambios.primerApellido : actual.primerApellido,
      cambios.segundoApellido !== undefined ? cambios.segundoApellido : actual.segundoApellido,
      actual.theme,
      cambios.isActive ?? actual.isActive,
      actual.createdAt,
      new Date(),
    );
    return this.usuarioRepo.update(usuario, cambios.roles ? { roles: cambios.roles, ...(cambios.documento ? { documento: cambios.documento } : {}) } : undefined);
  }
}
