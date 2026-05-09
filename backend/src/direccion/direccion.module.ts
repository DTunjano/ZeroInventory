import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DireccionEntityORM } from './infrastructure/persistence/direccion.orm-entity';
import { DireccionController } from './adapters/controllers/direccion.controller';
import { DireccionRepositoryImpl } from './infrastructure/persistence/direccion.repository-impl';
import { DireccionRepository } from './domain/repository/direccion.repository';
import { CreateDireccionUseCase } from './application/use-cases/create-direccion.use-case';
import { GetAllDireccionesUseCase } from './application/use-cases/get-all-direccion.use-case';
import { GetDireccionByIdUseCase } from './application/use-cases/get-direccion-by-id.use-case';
import { UpdateDireccionUseCase } from './application/use-cases/update-direccion.use-case';
import { DeleteDireccionUseCase } from './application/use-cases/delete-direccion.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([DireccionEntityORM])],
  controllers: [DireccionController],
  providers: [
    CreateDireccionUseCase,
    UpdateDireccionUseCase,
    DeleteDireccionUseCase,
    GetAllDireccionesUseCase,
    GetDireccionByIdUseCase,
    {
      provide: DireccionRepository,
      useClass: DireccionRepositoryImpl,
    },
  ],
})
export class DireccionModule {}
