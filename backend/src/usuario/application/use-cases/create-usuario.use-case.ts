import { ConflictException, Injectable } from '@nestjs/common';
import { UsuarioRepository } from '../../domain/repository/usuario.repository';
import { Usuario } from '../../domain/entity/usuario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateUsuarioUseCase {
  constructor(private readonly usuarioRepo: UsuarioRepository) {}

  async ejecutar(data: {
    username: string;
    password: string;
    primerNombre: string | null;
    segundoNombre: string | null;
    primerApellido: string | null;
    segundoApellido: string | null;
  }): Promise<Usuario> {
    const existingUser = await this.usuarioRepo.getByUsername(data.username);
    if (existingUser) {
      throw new ConflictException(
        'Ya existe un usuario con ese nombre de usuario',
      );
    }

    const hashPassword = await bcrypt.hash(data.password, 10);

    const usuario = new Usuario(
      0,
      data.username,
      hashPassword,
      data.primerNombre ?? null,
      data.segundoNombre ?? null,
      data.primerApellido ?? null,
      data.segundoApellido ?? null,
      true,
      new Date(),
      new Date(),
    );
    return this.usuarioRepo.create(usuario);
  }
}
