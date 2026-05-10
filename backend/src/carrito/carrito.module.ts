import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoEntityORM } from './infrastructure/persistence/carrito.orm-entity';
import { CarritoController } from './adapters/controllers/carrito.controller';
import { CarritoRepositoryImpl } from './infrastructure/persistence/carrito.repository-impl';
import { CarritoRepository } from './domain/repository/carrito.repository';
import { CreateCarritoUseCase } from './application/use-cases/create-carrito.use-case';
import { GetAllCarritosUseCase } from './application/use-cases/get-all-carrito.use-case';
import { GetCarritoByIdUseCase } from './application/use-cases/get-carrito-by-id.use-case';
import { UpdateCarritoUseCase } from './application/use-cases/update-carrito.use-case';
import { DeleteCarritoUseCase } from './application/use-cases/delete-carrito.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([CarritoEntityORM])],
  controllers: [CarritoController],
  providers: [
    CreateCarritoUseCase,
    UpdateCarritoUseCase,
    DeleteCarritoUseCase,
    GetAllCarritosUseCase,
    GetCarritoByIdUseCase,
    {
      provide: CarritoRepository,
      useClass: CarritoRepositoryImpl,
    },
  ],
})
export class CarritoModule {}
