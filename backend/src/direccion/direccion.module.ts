import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteModule } from '../cliente/cliente.module';
import { PedidoEntityORM } from '../pedido/infrastructure/persistence/pedido.orm-entity';
import { DireccionEntityORM } from './infrastructure/persistence/direccion.orm-entity';
import { DireccionController } from './adapters/controllers/direccion.controller';
import { DireccionRepositoryImpl } from './infrastructure/persistence/direccion.repository-impl';
import { DireccionRepository } from './domain/repository/direccion.repository';
import { CreateDireccionUseCase } from './application/use-cases/create-direccion.use-case';
import { GetAllDireccionesUseCase } from './application/use-cases/get-all-direccion.use-case';
import { GetDireccionByIdUseCase } from './application/use-cases/get-direccion-by-id.use-case';
import { UpdateDireccionUseCase } from './application/use-cases/update-direccion.use-case';
import { DeleteDireccionUseCase } from './application/use-cases/delete-direccion.use-case';
import { CreateMyDireccionUseCase } from './application/use-cases/create-my-direccion.use-case';
import { GetMyDireccionesUseCase } from './application/use-cases/get-my-direcciones.use-case';
import { SetPredeterminadaDireccionUseCase } from './application/use-cases/set-predeterminada-direccion.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([DireccionEntityORM, PedidoEntityORM]), ClienteModule],
  controllers: [DireccionController],
  providers: [
    CreateDireccionUseCase,
    CreateMyDireccionUseCase,
    UpdateDireccionUseCase,
    DeleteDireccionUseCase,
    GetAllDireccionesUseCase,
    GetDireccionByIdUseCase,
    GetMyDireccionesUseCase,
    SetPredeterminadaDireccionUseCase,
    {
      provide: DireccionRepository,
      useClass: DireccionRepositoryImpl,
    },
  ],
  exports: [DireccionRepository],
})
export class DireccionModule {}
