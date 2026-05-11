import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity'

export type JwtAccessPayload = {
  sub: number
  username: string
  roles: RolNombreEnum[]
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
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

  validate(payload: JwtAccessPayload) {
    return payload
  }
}
