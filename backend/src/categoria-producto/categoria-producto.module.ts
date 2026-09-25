import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaProductoEntityORM } from './infrastructure/persistence/categoria-producto.orm-entity';
import { CategoriaProductoController } from './adapters/controllers/categoria-producto.controller';
import { CategoriaProductoRepositoryImpl } from './infrastructure/persistence/categoria-producto.repository-impl';
import { CategoriaProductoRepository } from './domain/repository/categoria-producto.repository';
import { CreateCategoriaProductoUseCase } from './application/use-cases/create-categoria-producto.use-case';
import { GetAllCategoriaProductosUseCase } from './application/use-cases/get-all-categoria-producto.use-case';
import { GetCategoriaProductoByIdUseCase } from './application/use-cases/get-categoria-producto-by-id.use-case';
import { UpdateCategoriaProductoUseCase } from './application/use-cases/update-categoria-producto.use-case';
import { DeleteCategoriaProductoUseCase } from './application/use-cases/delete-categoria-producto.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaProductoEntityORM])],
  controllers: [CategoriaProductoController],
  providers: [
    CreateCategoriaProductoUseCase,
    UpdateCategoriaProductoUseCase,
    DeleteCategoriaProductoUseCase,
    GetAllCategoriaProductosUseCase,
    GetCategoriaProductoByIdUseCase,
    {
      provide: CategoriaProductoRepository,
      useClass: CategoriaProductoRepositoryImpl,
    },
  ],
})
export class CategoriaProductoModule {}
