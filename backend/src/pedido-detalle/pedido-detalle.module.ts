import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoDetalleEntityORM } from './infrastructure/persistence/pedido-detalle.orm-entity';
import { PedidoDetalleRepositoryImpl } from './infrastructure/persistence/pedido-detalle.repository-impl';
import { PedidoDetalleRepository } from './domain/repository/pedido-detalle.repository';
import { CreatePedidoDetalleUseCase } from './application/use-cases/create-pedido-detalle.use-case';
import { GetPedidoDetalleByIdUseCase } from './application/use-cases/get-pedido-detalle-by-id.use-case';
import { GetAllPedidoDetalleUseCase } from './application/use-cases/get-all-pedido-detalle.use-case';
import { UpdatePedidoDetalleUseCase } from './application/use-cases/update-pedido-detalle.use-case';
import { DeletePedidoDetalleUseCase } from './application/use-cases/delete-pedido-detalle.use-case';
import { PedidoDetalleController } from './adapters/controllers/pedido-detalle.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PedidoDetalleEntityORM])],
  controllers: [PedidoDetalleController],
  providers: [
    CreatePedidoDetalleUseCase,
    GetPedidoDetalleByIdUseCase,
    GetAllPedidoDetalleUseCase,
    UpdatePedidoDetalleUseCase,
    DeletePedidoDetalleUseCase,
    {
      provide: PedidoDetalleRepository,
      useClass: PedidoDetalleRepositoryImpl,
    },
  ],
})
export class PedidoDetalleModule {}
