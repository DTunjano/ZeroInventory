import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompraDetalleEntityORM } from './infrastructure/persistence/compra-detalle.orm-entity';
import { CompraDetalleController } from './adapters/controllers/compra-detalle.controller';
import { CompraDetalleRepositoryImpl } from './infrastructure/persistence/compra-detalle.repository-impl';
import { CompraDetalleRepository } from './domain/repository/compra-detalle.repository';
import { CreateCompraDetalleUseCase } from './application/use-cases/create-compra-detalle.use-case';
import { GetAllCompraDetallesUseCase } from './application/use-cases/get-all-compra-detalle.use-case';
import { GetCompraDetalleByIdUseCase } from './application/use-cases/get-compra-detalle-by-id.use-case';
import { UpdateCompraDetalleUseCase } from './application/use-cases/update-compra-detalle.use-case';
import { DeleteCompraDetalleUseCase } from './application/use-cases/delete-compra-detalle.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([CompraDetalleEntityORM])],
  controllers: [CompraDetalleController],
  providers: [
    CreateCompraDetalleUseCase,
    UpdateCompraDetalleUseCase,
    DeleteCompraDetalleUseCase,
    GetAllCompraDetallesUseCase,
    GetCompraDetalleByIdUseCase,
    {
      provide: CompraDetalleRepository,
      useClass: CompraDetalleRepositoryImpl,
    },
  ],
})
export class CompraDetalleModule {}
