import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoImagenEntityORM } from './infrastructure/persistence/producto-imagen.orm-entity';
import { ProductoImagenController } from './adapters/controllers/producto-imagen.controller';
import { ProductoImagenRepositoryImpl } from './infrastructure/persistence/producto-imagen.repository-impl';
import { ProductoImagenRepository } from './domain/repository/producto-imagen.repository';
import { CreateProductoImagenUseCase } from './application/use-cases/create-producto-imagen.use-case';
import { GetAllProductoImagenUseCase } from './application/use-cases/get-all-producto-imagen.use-case';
import { GetProductoImagenByIdUseCase } from './application/use-cases/get-producto-imagen-by-id.use-case';
import { UpdateProductoImagenUseCase } from './application/use-cases/update-producto-imagen.use-case';
import { DeleteProductoImagenUseCase } from './application/use-cases/delete-producto-imagen.use-case';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductoImagenEntityORM]),
    MulterModule.register({ storage: memoryStorage() }),
    CloudinaryModule,
  ],
  controllers: [ProductoImagenController],
  providers: [
    CreateProductoImagenUseCase,
    UpdateProductoImagenUseCase,
    DeleteProductoImagenUseCase,
    GetAllProductoImagenUseCase,
    GetProductoImagenByIdUseCase,
    {
      provide: ProductoImagenRepository,
      useClass: ProductoImagenRepositoryImpl,
    },
  ],
})
export class ProductoImagenModule {}
