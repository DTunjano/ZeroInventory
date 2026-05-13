import { Module } from '@nestjs/common';
import { UsuarioModule } from '../usuario/usuario.module';
import { ClienteModule } from '../cliente/cliente.module';
import { DireccionModule } from '../direccion/direccion.module';
import { SettingsController } from './adapters/controllers/settings.controller';
import { GetSettingsUseCase } from './application/use-cases/get-settings.use-case';
import { UpdateSettingsUseCase } from './application/use-cases/update-settings.use-case';
import { UpdatePasswordUseCase } from './application/use-cases/update-password.use-case';

@Module({
  imports: [UsuarioModule, ClienteModule, DireccionModule],
  controllers: [SettingsController],
  providers: [
    GetSettingsUseCase,
    UpdateSettingsUseCase,
    UpdatePasswordUseCase,
  ],
})
export class SettingsModule {}
