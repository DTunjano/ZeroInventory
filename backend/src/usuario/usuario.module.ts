import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioEntityORM } from './infrastructure/persistence/usuario.orm-entity';
import { UsuarioController } from './adapters/controllers/usuario.controller';
import { UsuarioRepositoryImpl } from './infrastructure/persistence/usuario.repository-impl';
import { UsuarioRepository } from './domain/repository/usuario.repository';
import { CreateUsuarioUseCase } from './application/use-cases/create-usuario.use-case';
import { GetAllUsuariosUseCase } from './application/use-cases/get-all-usuario.use-case';
import { GetUsuarioByIdUseCase } from './application/use-cases/get-usuario-by-id.use-case';
import { UpdateUsuarioUseCase } from './application/use-cases/update-usuario.use-case';
import { DeleteUsuarioUseCase } from './application/use-cases/delete-usuario.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioEntityORM])],
  controllers: [UsuarioController],
  providers: [
    CreateUsuarioUseCase,
    UpdateUsuarioUseCase,
    DeleteUsuarioUseCase,
    GetAllUsuariosUseCase,
    GetUsuarioByIdUseCase,
    {
      provide: UsuarioRepository,
      useClass: UsuarioRepositoryImpl,
    },
  ],
})
export class UsuarioModule {}
