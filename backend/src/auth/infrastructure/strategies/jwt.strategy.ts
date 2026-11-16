import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity'
import { AuthUserRepository } from '../../domain/repository/auth-user.repository'

export type JwtAccessPayload = {
  sub: number
  username: string
  roles: RolNombreEnum[]
}

/**
 * Estrategia JWT para NestJS.
 * Se asegura de que el payload incluya los roles del usuario para la autorización.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private readonly users: AuthUserRepository) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET')

    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET no configurado')
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    })
  }

  async validate(payload: JwtAccessPayload) {
    if (!Number.isInteger(payload.sub) || payload.sub <= 0) throw new UnauthorizedException('Sesión inválida')
    const user = await this.users.findById(payload.sub)
    if (!user?.isActive) throw new UnauthorizedException('La cuenta no está activa')
    return {
      sub: payload.sub,
      usuarioId: payload.sub,
      username: user.username,
      roles: user.roles,
    }
  }
}
