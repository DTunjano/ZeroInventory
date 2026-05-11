import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { AuthUserRepository } from '../../domain/repository/auth-user.repository'
import { AuthUser } from '../../domain/types/auth-user.type'
import { UsuarioEntityORM } from '../../../usuario/infrastructure/persistence/usuario.orm-entity'
import { UsuarioRolEntityORM } from '../../../usuario-rol/infrastructure/persistence/usuario-rol.orm-entity'

@Injectable()
export class AuthUserRepositoryImpl implements AuthUserRepository {
  constructor(
    @InjectRepository(UsuarioEntityORM)
    private readonly usuarioRepo: Repository<UsuarioEntityORM>,
    @InjectRepository(UsuarioRolEntityORM)
    private readonly usuarioRolRepo: Repository<UsuarioRolEntityORM>,
  ) {}

  async findByUsername(username: string): Promise<AuthUser | null> {
    const usuario = await this.usuarioRepo.findOne({
      where: { username },
    })

    if (!usuario) return null

    const roles = await this.usuarioRolRepo.find({
      where: { usuarioId: usuario.usuarioId },
      relations: { rol: true },
    })

    return {
      usuarioId: usuario.usuarioId,
      username: usuario.username,
      passwordHash: usuario.password,
      isActive: usuario.isActive,
      roles: roles.map((ur) => ur.rol.nombre),
    }
  }

  async findById(usuarioId: number): Promise<AuthUser | null> {
    const usuario = await this.usuarioRepo.findOne({
      where: { usuarioId },
    })

    if (!usuario) return null

    const roles = await this.usuarioRolRepo.find({
      where: { usuarioId: usuario.usuarioId },
      relations: { rol: true },
    })

    return {
      usuarioId: usuario.usuarioId,
      username: usuario.username,
      passwordHash: usuario.password,
      isActive: usuario.isActive,
      roles: roles.map((ur) => ur.rol.nombre),
    }
  }
}
