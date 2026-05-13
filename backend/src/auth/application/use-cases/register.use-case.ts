import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

import { ClienteRepository } from '../../../cliente/domain/repository/cliente.repository'
import { Cliente, TipoDocumentoEnum } from '../../../cliente/domain/entity/cliente.entity'
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity'
import { RolRepository } from '../../../rol/domain/repository/rol.repository'
import { Usuario } from '../../../usuario/domain/entity/usuario.entity'
import { UsuarioRepository } from '../../../usuario/domain/repository/usuario.repository'
import { UsuarioRol } from '../../../usuario-rol/domain/entity/usuario-rol.entity'
import { UsuarioRolRepository } from '../../../usuario-rol/domain/repository/usuario-rol.repository'

import { LoginUseCase } from './login.use-case'
import { RegisterDTO } from '../dto/register.dto'

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly usuarioRepo: UsuarioRepository,
    private readonly clienteRepo: ClienteRepository,
    private readonly usuarioRolRepo: UsuarioRolRepository,
    private readonly rolRepo: RolRepository,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async ejecutar(input: RegisterDTO): Promise<{ result: any; refreshToken: string }> {
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

    const createdUsuario = await this.usuarioRepo.create(usuario)

    const cliente = new Cliente(
      0,
      createdUsuario.usuarioId,
      input.tipoDocumento ?? TipoDocumentoEnum.CC,
      input.documento,
      now,
      now,
    )
    await this.clienteRepo.create(cliente)

    const customerRolePage = await this.rolRepo.getAll({
      nombre: RolNombreEnum.CUSTOMER,
      page: 1,
      limit: 1,
    })
    const customerRole = customerRolePage.data[0]
    if (!customerRole) {
      throw new UnauthorizedException('El rol CUSTOMER no está configurado')
    }

    await this.usuarioRolRepo.create(new UsuarioRol(0, createdUsuario.usuarioId, customerRole.rolId))

    return this.loginUseCase.ejecutar({
      username: input.username,
      password: input.password,
    })
  }
}