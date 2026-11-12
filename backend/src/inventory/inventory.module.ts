import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { KardexEntityORM } from '../kardex/infrastructure/persistence/kardex.orm-entity'
import { AjusteInventarioEntityORM } from '../ajuste-inventario/infrastructure/persistence/ajuste-inventario.orm-entity'

// Use cases
import { CreateKardexMovementUseCase } from './application/use-cases/create-kardex-movement.use-case'
import { GetInventoryAdjustmentsUseCase } from './application/use-cases/get-inventory-adjustments.use-case'
import { RegisterStockEntryUseCase } from './application/use-cases/register-stock-entry.use-case'
import { RegisterStockAdjustmentUseCase } from './application/use-cases/register-stock-adjustment.use-case'
import { ValidateStockUseCase } from './application/use-cases/validate-stock.use-case'

// Repositories
import { KardexRepository } from './infrastructure/repositories/kardex.repository'
import { StockAdjustmentRepository } from './infrastructure/repositories/stock-adjustment.repository'

// Domain interfaces

// Controllers
import { InventoryController } from './adapters/controllers/inventory.controller'
import { InventoryAdjustmentsController } from './adapters/controllers/inventory-adjustments.controller'

@Module({
  imports: [TypeOrmModule.forFeature([KardexEntityORM, AjusteInventarioEntityORM])],
  controllers: [InventoryController, InventoryAdjustmentsController],
  providers: [
    // Use cases
    CreateKardexMovementUseCase,
    RegisterStockEntryUseCase,
    RegisterStockAdjustmentUseCase,
    ValidateStockUseCase,
    GetInventoryAdjustmentsUseCase,

    // Repositories - Implementaciones
    KardexRepository,
    StockAdjustmentRepository,

    // Inyección por token (para inversión de dependencias)
    {
      provide: 'IKardexRepository',
      useClass: KardexRepository,
    },
    {
      provide: 'IStockAdjustmentRepository',
      useClass: StockAdjustmentRepository,
    },
  ],
  exports: [
    // Exportar use cases y repositorios para que otros módulos puedan usarlos
    CreateKardexMovementUseCase,
    RegisterStockEntryUseCase,
    RegisterStockAdjustmentUseCase,
    ValidateStockUseCase,
    GetInventoryAdjustmentsUseCase,
    'IKardexRepository',
    'IStockAdjustmentRepository',
  ],
})
export class InventoryModule {}
