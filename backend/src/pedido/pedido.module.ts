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

@Module({
  imports: [TypeOrmModule.forFeature([PedidoEntityORM])],
  controllers: [PedidoController],
  providers: [
    CreatePedidoUseCase,
    UpdatePedidoUseCase,
    DeletePedidoUseCase,
    GetAllPedidosUseCase,
    GetPedidoByIdUseCase,
    {
      provide: PedidoRepository,
      useClass: PedidoRepositoryImpl,
    },
  ],
})
export class PedidoModule {}
