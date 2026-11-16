import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagoEntityORM } from './infrastructure/persistence/pago.orm-entity';
import { PagoRepositoryImpl } from './infrastructure/persistence/pago.repository-impl';
import { PagoRepository } from './domain/repository/pago.repository';
import { GetPagoByIdUseCase } from './application/use-cases/get-pago-by-id.use-case';
import { GetAllPagoUseCase } from './application/use-cases/get-all-pago.use-case';
import { PagoReadController } from './adapters/controllers/pago-read.controller';
@Module({imports:[TypeOrmModule.forFeature([PagoEntityORM])],controllers:[PagoReadController],providers:[GetPagoByIdUseCase,GetAllPagoUseCase,{provide:PagoRepository,useClass:PagoRepositoryImpl}]})
export class PagoModule {}
