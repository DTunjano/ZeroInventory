import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { JwtSignOptions } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'

import { AuthUserRepository } from '../../domain/repository/auth-user.repository'
import { AuthResponseDTO } from '../dto/auth-response.dto'
import { LoginDTO } from '../dto/login.dto'
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity'

type AccessTokenPayload = {
  sub: number
  username: string
  roles: RolNombreEnum[]
}

type RefreshTokenPayload = {
  sub: number
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly authUserRepo: AuthUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async ejecutar(input: LoginDTO): Promise<{ result: AuthResponseDTO; refreshToken: string }> {
    const user = await this.authUserRepo.findByUsername(input.username)

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash)
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET')
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')

    if (!accessSecret || !refreshSecret) {
      throw new UnauthorizedException('Auth no configurado (JWT secrets faltantes)')
    }

    const accessExpiresIn =
      (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
        '15m') as JwtSignOptions['expiresIn']
    const refreshExpiresIn =
      (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ??
        '7d') as JwtSignOptions['expiresIn']

    const accessPayload: AccessTokenPayload = {
      sub: user.usuarioId,
      username: user.username,
      roles: user.roles,
    }

    const refreshPayload: RefreshTokenPayload = {
      sub: user.usuarioId,
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ])

    return {
      refreshToken,
      result: {
        accessToken,
        user: {
          usuarioId: user.usuarioId,
          username: user.username,
          roles: user.roles,
        },
      },
    }
  }
}
