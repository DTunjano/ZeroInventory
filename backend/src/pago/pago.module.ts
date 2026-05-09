import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagoEntityORM } from './infrastructure/persistence/pago.orm-entity';
import { PagoRepositoryImpl } from './infrastructure/persistence/pago.repository-impl';
import { PagoRepository } from './domain/repository/pago.repository';
import { CreatePagoUseCase } from './application/use-cases/create-pago.use-case';
import { GetPagoByIdUseCase } from './application/use-cases/get-pago-by-id.use-case';
import { GetAllPagoUseCase } from './application/use-cases/get-all-pago.use-case';
import { UpdatePagoUseCase } from './application/use-cases/update-pago.use-case';
import { DeletePagoUseCase } from './application/use-cases/delete-pago.use-case';
import { PagoController } from './adapters/controllers/pago.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PagoEntityORM])],
  controllers: [PagoController],
  providers: [
    CreatePagoUseCase,
    GetPagoByIdUseCase,
    GetAllPagoUseCase,
    UpdatePagoUseCase,
    DeletePagoUseCase,
    {
      provide: PagoRepository,
      useClass: PagoRepositoryImpl,
    },
  ],
})
export class PagoModule {}
