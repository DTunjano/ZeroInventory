import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KardexEntityORM } from './infrastructure/persistence/kardex.orm-entity';
import { KardexController } from './adapters/controllers/kardex.controller';
import { KardexRepositoryImpl } from './infrastructure/persistence/kardex.repository-impl';
import { KardexRepository } from './domain/repository/kardex.repository';
import { CreateKardexUseCase } from './application/use-cases/create-kardex.use-case';
import { GetAllKardexUseCase } from './application/use-cases/get-all-kardex.use-case';
import { GetKardexByIdUseCase } from './application/use-cases/get-kardex-by-id.use-case';
import { UpdateKardexUseCase } from './application/use-cases/update-kardex.use-case';
import { DeleteKardexUseCase } from './application/use-cases/delete-kardex.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([KardexEntityORM])],
  controllers: [KardexController],
  providers: [
    CreateKardexUseCase,
    UpdateKardexUseCase,
    DeleteKardexUseCase,
    GetAllKardexUseCase,
    GetKardexByIdUseCase,
    {
      provide: KardexRepository,
      useClass: KardexRepositoryImpl,
    },
  ],
})
export class KardexModule {}
