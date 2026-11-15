import { Module } from '@nestjs/common';
import { ClienteModule } from '../cliente/cliente.module';
import { PedidoWorkflowController } from './adapters/controllers/pedido-workflow.controller';
import { PedidoWorkflowUseCase } from './application/pedido-workflow.use-case';
import { PedidoWorkflowRepository } from './domain/repository/pedido-workflow.repository';
import { TypeOrmPedidoWorkflowRepository } from './infrastructure/persistence/pedido-workflow.repository';
@Module({imports:[ClienteModule],controllers:[PedidoWorkflowController],providers:[PedidoWorkflowUseCase,{provide:PedidoWorkflowRepository,useClass:TypeOrmPedidoWorkflowRepository}]})
export class PedidoModule {}
