import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import type { Request, Response } from 'express'

import { LoginDTO } from '../../application/dto/login.dto'
import { AuthResponseDTO } from '../../application/dto/auth-response.dto'
import { LoginUseCase } from '../../application/use-cases/login.use-case'
import { RefreshUseCase } from '../../application/use-cases/refresh.use-case'
import { RegisterDTO } from '../../application/dto/register.dto'
import { RegisterUseCase } from '../../application/use-cases/register.use-case'

const REFRESH_COOKIE_NAME = 'refresh_token'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  @Post('login')
  @ApiOkResponse({ type: AuthResponseDTO })
  async login(
    @Body() body: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDTO> {
    const { result, refreshToken } = await this.loginUseCase.ejecutar(body)
    this.setRefreshCookie(res, refreshToken)
    return result
  }

  @Post('register')
  @ApiOkResponse({ type: AuthResponseDTO })
  async register(
    @Body() body: RegisterDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDTO> {
    const { result, refreshToken } = await this.registerUseCase.ejecutar(body)
    this.setRefreshCookie(res, refreshToken)
    return result
  }

  @Post('refresh')
  @ApiOkResponse({ type: AuthResponseDTO })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDTO> {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined
    if (!token) {
      throw new UnauthorizedException('Refresh token requerido')
    }

    const { result, refreshToken } = await this.refreshUseCase.ejecutar(token)
    this.setRefreshCookie(res, refreshToken)
    return result
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ success: true }> {
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/auth/refresh',
    })
    return { success: true }
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/auth/refresh',
    })
  }
}
