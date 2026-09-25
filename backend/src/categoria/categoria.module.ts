import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaEntityORM } from './infrastructure/persistence/categoria.orm-entity';
import { CategoriaController } from './adapters/controllers/categoria.controller';
import { CategoriaRepositoryImpl } from './infrastructure/persistence/categoria.repository-impl';
import { CategoriaRepository } from './domain/repository/categoria.repository';
import { CreateCategoriaUseCase } from './application/use-cases/create-categoria.use-case';
import { GetAllCategoriasUseCase } from './application/use-cases/get-all-categoria.use-case';
import { GetCategoriaByIdUseCase } from './application/use-cases/get-categoria-by-id.use-case';
import { UpdateCategoriaUseCase } from './application/use-cases/update-categoria.use-case';
import { DeleteCategoriaUseCase } from './application/use-cases/delete-categoria.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaEntityORM])],
  controllers: [CategoriaController],
  providers: [
    CreateCategoriaUseCase,
    UpdateCategoriaUseCase,
    DeleteCategoriaUseCase,
    GetAllCategoriasUseCase,
    GetCategoriaByIdUseCase,
    {
      provide: CategoriaRepository,
      useClass: CategoriaRepositoryImpl,
    },
  ],
})
export class CategoriaModule {}
