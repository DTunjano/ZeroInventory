import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoORMEntity } from './infrastructure/persistence/producto.orm-entity';
import { ProductoController } from './adapters/controllers/producto.controller';
import { ProductoRepositoryImpl } from './infrastructure/persistence/producto.repository-impl';
import { ProductoRepository } from './domain/repository/producto.repository';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { GetAllProductosUseCase } from './application/use-cases/get-all-product.use-case';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([ProductoORMEntity])],
  controllers: [ProductoController],
  providers: [
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetAllProductosUseCase,
    GetProductByIdUseCase,
    {
      provide: ProductoRepository,
      useClass: ProductoRepositoryImpl,
    },
  ],
})
export class ProductoModule {}
