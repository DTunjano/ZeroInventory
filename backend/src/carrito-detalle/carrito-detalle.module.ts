import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoDetalleEntityORM } from './infrastructure/persistence/carrito-detalle.orm-entity';
import { CarritoDetalleController } from './adapters/controllers/carrito-detalle.controller';
import { CarritoDetalleRepositoryImpl } from './infrastructure/persistence/carrito-detalle.repository-impl';
import { CarritoDetalleRepository } from './domain/repository/carrito-detalle.repository';
import { CreateCarritoDetalleUseCase } from './application/use-cases/create-carrito-detalle.use-case';
import { GetAllCarritoDetallesUseCase } from './application/use-cases/get-all-carrito-detalle.use-case';
import { GetCarritoDetalleByIdUseCase } from './application/use-cases/get-carrito-detalle-by-id.use-case';
import { UpdateCarritoDetalleUseCase } from './application/use-cases/update-carrito-detalle.use-case';
import { DeleteCarritoDetalleUseCase } from './application/use-cases/delete-carrito-detalle.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([CarritoDetalleEntityORM])],
  controllers: [CarritoDetalleController],
  providers: [
    CreateCarritoDetalleUseCase,
    UpdateCarritoDetalleUseCase,
    DeleteCarritoDetalleUseCase,
    GetAllCarritoDetallesUseCase,
    GetCarritoDetalleByIdUseCase,
    {
      provide: CarritoDetalleRepository,
      useClass: CarritoDetalleRepositoryImpl,
    },
  ],
})
export class CarritoDetalleModule {}
