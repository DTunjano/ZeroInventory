import { ConflictException, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

import { ClienteRepository } from '../../../cliente/domain/repository/cliente.repository'
import { TipoDocumentoEnum } from '../../../cliente/domain/entity/cliente.entity'
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity'
import { Usuario } from '../../../usuario/domain/entity/usuario.entity'
import { UsuarioRepository } from '../../../usuario/domain/repository/usuario.repository'

import { LoginUseCase } from './login.use-case'
import { RegisterDTO } from '../dto/register.dto'
import { AuthResponseDTO } from '../dto/auth-response.dto'

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly usuarioRepo: UsuarioRepository,
    private readonly clienteRepo: ClienteRepository,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async ejecutar(input: RegisterDTO): Promise<{ result: AuthResponseDTO; refreshToken: string }> {
    const existingUsuario = await this.usuarioRepo.getByUsername(input.username)
    if (existingUsuario) {
      throw new ConflictException('Ya existe un usuario con ese nombre')
    }

    const existingCliente = await this.clienteRepo.getByDocumento(input.documento)
    if (existingCliente) {
      throw new ConflictException('Ya existe un cliente con ese documento')
    }

    const now = new Date()
    const passwordHash = await bcrypt.hash(input.password, 10)
    const usuario = new Usuario(
      0,
      input.username,
      null,
      null,
      passwordHash,
      input.primerNombre ?? null,
      null,
      input.primerApellido ?? null,
      null,
      'dark',
      true,
      now,
      now,
    )

    await this.usuarioRepo.create(usuario, {
      roles: [RolNombreEnum.CUSTOMER], documento: input.documento,
      tipoDocumento: input.tipoDocumento ?? TipoDocumentoEnum.CC,
    })

    return this.loginUseCase.ejecutar({
      username: input.username,
      password: input.password,
    })
  }
}
