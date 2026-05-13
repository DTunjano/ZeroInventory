import {
  Body,
  Controller,
  Get,
  Patch,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/adapters/guards/jwt-auth.guard';
import { GetSettingsUseCase } from '../../application/use-cases/get-settings.use-case';
import { UpdateSettingsUseCase } from '../../application/use-cases/update-settings.use-case';
import { UpdatePasswordUseCase } from '../../application/use-cases/update-password.use-case';
import { UpdateSettingsDto } from '../../application/dto/update-settings.dto';
import { UpdatePasswordDto } from '../../application/dto/update-password.dto';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(
    private readonly getSettingsUseCase: GetSettingsUseCase,
    private readonly updateSettingsUseCase: UpdateSettingsUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase,
  ) {}

  @Get()
  async getSettings(@Req() req: any) {
    const usuarioId = req.user.sub;
    return this.getSettingsUseCase.ejecutar(usuarioId);
  }

  @Put()
  async updateSettings(
    @Req() req: any,
    @Body() body: UpdateSettingsDto,
  ) {
    const usuarioId = req.user.sub;
    await this.updateSettingsUseCase.ejecutar(usuarioId, body);
    return { message: 'Configuración actualizada correctamente' };
  }

  @Patch('password')
  async updatePassword(
    @Req() req: any,
    @Body() body: UpdatePasswordDto,
  ) {
    const usuarioId = req.user.sub;
    await this.updatePasswordUseCase.ejecutar(usuarioId, body);
    return { message: 'Contraseña actualizada correctamente' };
  }
}
