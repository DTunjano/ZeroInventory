import {
  Body,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import type { Request, Response } from 'express'

import { LoginDTO } from '../../application/dto/login.dto'
import { AuthResponseDTO } from '../../application/dto/auth-response.dto'
import { LoginUseCase } from '../../application/use-cases/login.use-case'
import { RefreshUseCase } from '../../application/use-cases/refresh.use-case'
import { RegisterDTO } from '../../application/dto/register.dto'
import { RegisterUseCase } from '../../application/use-cases/register.use-case'
import { Public } from '../decorators/public.decorator'

const REFRESH_COOKIE_NAME = 'refresh_token'

@ApiTags('Auth')
@Controller('auth')
@Public()
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly config: ConfigService,
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
  ): Promise<AuthResponseDTO | null> {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined
    if (!token) {
      return null
    }

    const refreshed = await this.refreshUseCase.ejecutar(token)
    if (!refreshed) {
      return null
    }
    const { result, refreshToken } = refreshed
    this.setRefreshCookie(res, refreshToken)
    return result
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response): { success: true } {
    res.clearCookie(REFRESH_COOKIE_NAME, this.cookieOptions())
    return { success: true }
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE_NAME, token, this.cookieOptions())
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      sameSite: (this.config.get<string>('COOKIE_SAME_SITE') ?? 'lax') as 'lax' | 'strict' | 'none',
      secure: this.config.get<string>('NODE_ENV') === 'production' || this.config.get<string>('COOKIE_SECURE') === 'true',
      path: '/auth/refresh',
    }
  }
}
