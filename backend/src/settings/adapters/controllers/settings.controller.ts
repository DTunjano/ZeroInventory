import {
  Body,
  Controller,
  Get,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/adapters/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/adapters/guards/roles.guard';
import { Roles } from '../../../auth/adapters/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/adapters/decorators/current-user.decorator';
import { GetSettingsUseCase } from '../../application/use-cases/get-settings.use-case';
import { UpdateSettingsUseCase } from '../../application/use-cases/update-settings.use-case';
import { UpdatePasswordUseCase } from '../../application/use-cases/update-password.use-case';
import { UpdateSettingsDto } from '../../application/dto/update-settings.dto';
import { UpdatePasswordDto } from '../../application/dto/update-password.dto';
import { UpdateAppearanceDto } from '../../application/dto/update-appearance.dto';
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(
    private readonly getSettingsUseCase: GetSettingsUseCase,
    private readonly updateSettingsUseCase: UpdateSettingsUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase,
  ) {}

  @Get()
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.CUSTOMER)
  async getSettings(@CurrentUser() usuarioId: number) {
    return this.getSettingsUseCase.ejecutar(usuarioId);
  }

  @Put()
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.CUSTOMER)
  async updateSettings(@CurrentUser() usuarioId: number, @Body() body: UpdateSettingsDto) {
    await this.updateSettingsUseCase.ejecutar(usuarioId, body);
    return { message: 'Configuración actualizada correctamente' };
  }

  @Patch('password')
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.CUSTOMER)
  async updatePassword(@CurrentUser() usuarioId: number, @Body() body: UpdatePasswordDto) {
    await this.updatePasswordUseCase.ejecutar(usuarioId, body);
    return { message: 'Contraseña actualizada correctamente' };
  }

  @Get('appearance')
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.CUSTOMER, RolNombreEnum.EMPLOYEE)
  async getAppearance(@CurrentUser() usuarioId: number) {
    const settings = await this.getSettingsUseCase.ejecutar(usuarioId);
    return { theme: settings.theme };
  }

  @Patch('appearance')
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.CUSTOMER, RolNombreEnum.EMPLOYEE)
  async updateAppearance(@CurrentUser() usuarioId: number, @Body() body: UpdateAppearanceDto) {
    await this.updateSettingsUseCase.ejecutar(usuarioId, { theme: body.theme });
    return { message: 'Tema actualizado correctamente' };
  }
}
