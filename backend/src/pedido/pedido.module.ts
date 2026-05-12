import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoEntityORM } from './infrastructure/persistence/pedido.orm-entity';
import { PedidoController } from './adapters/controllers/pedido.controller';
import { PedidoRepositoryImpl } from './infrastructure/persistence/pedido.repository-impl';
import { PedidoRepository } from './domain/repository/pedido.repository';
import { CreatePedidoUseCase } from './application/use-cases/create-pedido.use-case';
import { GetAllPedidosUseCase } from './application/use-cases/get-all-pedido.use-case';
import { GetPedidoByIdUseCase } from './application/use-cases/get-pedido-by-id.use-case';
import { UpdatePedidoUseCase } from './application/use-cases/update-pedido.use-case';
import { DeletePedidoUseCase } from './application/use-cases/delete-pedido.use-case';
import { GetOrdersByClienteUseCase } from './application/use-cases/get-orders-by-cliente.use-case';
import { ClienteModule } from '../cliente/cliente.module';

@Module({
  imports: [TypeOrmModule.forFeature([PedidoEntityORM]), ClienteModule],
  controllers: [PedidoController],
  providers: [
    CreatePedidoUseCase,
    UpdatePedidoUseCase,
    DeletePedidoUseCase,
    GetAllPedidosUseCase,
    GetPedidoByIdUseCase,
    GetOrdersByClienteUseCase,
    {
      provide: PedidoRepository,
      useClass: PedidoRepositoryImpl,
    },
  ],
  exports: [PedidoRepository],
})
export class PedidoModule {}
