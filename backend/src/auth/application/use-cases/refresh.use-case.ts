import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { JwtSignOptions } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

import { AuthUserRepository } from '../../domain/repository/auth-user.repository'
import { AuthResponseDTO } from '../dto/auth-response.dto'

type RefreshTokenPayload = {
  sub: number
  iat?: number
  exp?: number
}

@Injectable()
export class RefreshUseCase {
  constructor(
    private readonly authUserRepo: AuthUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async ejecutar(refreshToken: string): Promise<{ result: AuthResponseDTO; refreshToken: string } | null> {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET')
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')

    if (!accessSecret || !refreshSecret) {
      return null
    }

    let payload: RefreshTokenPayload

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: refreshSecret,
      })
    } catch {
      return null
    }

    const user = await this.authUserRepo.findById(payload.sub)
    if (!user || !user.isActive) {
      return null
    }

    const accessExpiresIn =
      (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
        '15m') as JwtSignOptions['expiresIn']
    const refreshExpiresIn =
      (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ??
        '7d') as JwtSignOptions['expiresIn']

    const newAccessToken = await this.jwtService.signAsync(
      {
        sub: user.usuarioId,
        username: user.username,
        roles: user.roles,
      },
      {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      },
    )

    const newRefreshToken = await this.jwtService.signAsync(
      { sub: user.usuarioId },
      {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      },
    )

    return {
      refreshToken: newRefreshToken,
      result: {
        accessToken: newAccessToken,
        user: {
          usuarioId: user.usuarioId,
          username: user.username,
          roles: user.roles,
        },
      },
    }
  }
}
