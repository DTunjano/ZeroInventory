import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompraEntityORM } from './infrastructure/persistence/compra.orm-entity';
import { CompraController } from './adapters/controllers/compra.controller';
import { CompraRepositoryImpl } from './infrastructure/persistence/compra.repository-impl';
import { CompraRepository } from './domain/repository/compra.repository';
import { CreateCompraUseCase } from './application/use-cases/create-compra.use-case';
import { GetAllComprasUseCase } from './application/use-cases/get-all-compra.use-case';
import { GetCompraByIdUseCase } from './application/use-cases/get-compra-by-id.use-case';
import { UpdateCompraUseCase } from './application/use-cases/update-compra.use-case';
import { DeleteCompraUseCase } from './application/use-cases/delete-compra.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([CompraEntityORM])],
  controllers: [CompraController],
  providers: [
    CreateCompraUseCase,
    UpdateCompraUseCase,
    DeleteCompraUseCase,
    GetAllComprasUseCase,
    GetCompraByIdUseCase,
    {
      provide: CompraRepository,
      useClass: CompraRepositoryImpl,
    },
  ],
})
export class CompraModule {}
