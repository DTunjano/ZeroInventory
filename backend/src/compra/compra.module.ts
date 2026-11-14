import { Module } from '@nestjs/common';
import { CompraController } from './adapters/controllers/compra.controller';
import { CompraWorkflowUseCase } from './application/compra-workflow.use-case';
import { CompraWorkflowRepository } from './domain/repository/compra-workflow.repository';
import { TypeOrmCompraWorkflowRepository } from './infrastructure/persistence/compra-workflow.repository';

@Module({
  controllers: [CompraController],
  providers: [
    CompraWorkflowUseCase,
    {
      provide: CompraWorkflowRepository,
      useClass: TypeOrmCompraWorkflowRepository,
    },
  ],
})
export class CompraModule {}
