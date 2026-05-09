import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolEntityORM } from './infrastructure/persistence/rol.orm-entity';
import { RolRepositoryImpl } from './infrastructure/persistence/rol.repository-impl';
import { RolRepository } from './domain/repository/rol.repository';
import { CreateRolUseCase } from './application/use-cases/create-rol.use-case';
import { GetRolByIdUseCase } from './application/use-cases/get-rol-by-id.use-case';
import { GetAllRolUseCase } from './application/use-cases/get-all-rol.use-case';
import { UpdateRolUseCase } from './application/use-cases/update-rol.use-case';
import { DeleteRolUseCase } from './application/use-cases/delete-rol.use-case';
import { RolController } from './adapters/controllers/rol.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RolEntityORM])],
  controllers: [RolController],
  providers: [
    CreateRolUseCase,
    GetRolByIdUseCase,
    GetAllRolUseCase,
    UpdateRolUseCase,
    DeleteRolUseCase,
    {
      provide: RolRepository,
      useClass: RolRepositoryImpl,
    },
  ],
})
export class RolModule {}
