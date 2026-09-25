import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioRolEntityORM } from './infrastructure/persistence/usuario-rol.orm-entity';
import { UsuarioRolRepositoryImpl } from './infrastructure/persistence/usuario-rol.repository-impl';
import { UsuarioRolRepository } from './domain/repository/usuario-rol.repository';
import { CreateUsuarioRolUseCase } from './application/use-cases/create-usuario-rol.use-case';
import { GetUsuarioRolByIdUseCase } from './application/use-cases/get-usuario-rol-by-id.use-case';
import { GetAllUsuarioRolUseCase } from './application/use-cases/get-all-usuario-rol.use-case';
import { UpdateUsuarioRolUseCase } from './application/use-cases/update-usuario-rol.use-case';
import { DeleteUsuarioRolUseCase } from './application/use-cases/delete-usuario-rol.use-case';
import { UsuarioRolController } from './adapters/controllers/usuario-rol.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioRolEntityORM])],
  controllers: [UsuarioRolController],
  providers: [
    CreateUsuarioRolUseCase,
    GetUsuarioRolByIdUseCase,
    GetAllUsuarioRolUseCase,
    UpdateUsuarioRolUseCase,
    DeleteUsuarioRolUseCase,
    {
      provide: UsuarioRolRepository,
      useClass: UsuarioRolRepositoryImpl,
    },
  ],
})
export class UsuarioRolModule {}
