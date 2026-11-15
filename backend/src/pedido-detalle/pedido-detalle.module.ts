import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoDetalleEntityORM } from './infrastructure/persistence/pedido-detalle.orm-entity';
import { PedidoDetalleRepositoryImpl } from './infrastructure/persistence/pedido-detalle.repository-impl';
import { PedidoDetalleRepository } from './domain/repository/pedido-detalle.repository';
import { GetPedidoDetalleByIdUseCase } from './application/use-cases/get-pedido-detalle-by-id.use-case';
import { GetAllPedidoDetalleUseCase } from './application/use-cases/get-all-pedido-detalle.use-case';
import { PedidoDetalleReadController } from './adapters/controllers/pedido-detalle-read.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PedidoDetalleEntityORM])],
  controllers: [PedidoDetalleReadController],
  providers: [
    GetPedidoDetalleByIdUseCase,
    GetAllPedidoDetalleUseCase,
    {
      provide: PedidoDetalleRepository,
      useClass: PedidoDetalleRepositoryImpl,
    },
  ],
})
export class PedidoDetalleModule {}
