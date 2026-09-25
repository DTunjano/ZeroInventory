import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProveedorEntityORM } from './infrastructure/persistence/proveedor.orm-entity';
import { ProveedorController } from './adapters/controllers/proveedor.controller';
import { ProveedorRepositoryImpl } from './infrastructure/persistence/proveedor.repository-impl';
import { ProveedorRepository } from './domain/repository/proveedor.repository';
import { CreateProveedorUseCase } from './application/use-cases/create-proveedor.use-case';
import { GetAllProveedoresUseCase } from './application/use-cases/get-all-proveedor.use-case';
import { GetProveedorByIdUseCase } from './application/use-cases/get-proveedor-by-id.use-case';
import { UpdateProveedorUseCase } from './application/use-cases/update-proveedor.use-case';
import { DeleteProveedorUseCase } from './application/use-cases/delete-proveedor.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([ProveedorEntityORM])],
  controllers: [ProveedorController],
  providers: [
    CreateProveedorUseCase,
    UpdateProveedorUseCase,
    DeleteProveedorUseCase,
    GetAllProveedoresUseCase,
    GetProveedorByIdUseCase,
    {
      provide: ProveedorRepository,
      useClass: ProveedorRepositoryImpl,
    },
  ],
})
export class ProveedorModule {}
