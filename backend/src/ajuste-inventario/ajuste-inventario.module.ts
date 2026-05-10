import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AjusteInventarioEntityORM } from './infrastructure/persistence/ajuste-inventario.orm-entity';
import { AjusteInventarioController } from './adapters/controllers/ajuste-inventario.controller';
import { AjusteInventarioRepositoryImpl } from './infrastructure/persistence/ajuste-inventario.repository-impl';
import { AjusteInventarioRepository } from './domain/repository/ajuste-inventario.repository';
import { CreateAjusteInventarioUseCase } from './application/use-cases/create-ajuste-inventario.use-case';
import { GetAllAjustesInventarioUseCase } from './application/use-cases/get-all-ajuste-inventario.use-case';
import { GetAjusteInventarioByIdUseCase } from './application/use-cases/get-ajuste-inventario-by-id.use-case';
import { UpdateAjusteInventarioUseCase } from './application/use-cases/update-ajuste-inventario.use-case';
import { DeleteAjusteInventarioUseCase } from './application/use-cases/delete-ajuste-inventario.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([AjusteInventarioEntityORM])],
  controllers: [AjusteInventarioController],
  providers: [
    CreateAjusteInventarioUseCase,
    UpdateAjusteInventarioUseCase,
    DeleteAjusteInventarioUseCase,
    GetAllAjustesInventarioUseCase,
    GetAjusteInventarioByIdUseCase,
    {
      provide: AjusteInventarioRepository,
      useClass: AjusteInventarioRepositoryImpl,
    },
  ],
})
export class AjusteInventarioModule {}
