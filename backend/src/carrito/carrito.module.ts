import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoEntityORM } from './infrastructure/persistence/carrito.orm-entity';
import { CarritoController } from './adapters/controllers/carrito.controller';
import { CarritoRepositoryImpl } from './infrastructure/persistence/carrito.repository-impl';
import { CarritoRepository } from './domain/repository/carrito.repository';
import { CreateCarritoUseCase } from './application/use-cases/create-carrito.use-case';
import { GetAllCarritosUseCase } from './application/use-cases/get-all-carrito.use-case';
import { GetCarritoByIdUseCase } from './application/use-cases/get-carrito-by-id.use-case';
import { UpdateCarritoUseCase } from './application/use-cases/update-carrito.use-case';
import { DeleteCarritoUseCase } from './application/use-cases/delete-carrito.use-case';
import { CarritoDetalleModule } from '../carrito-detalle/carrito-detalle.module';
import { ProductoModule } from '../producto/producto.module';
import { ClienteModule } from '../cliente/cliente.module';
import { DireccionModule } from '../direccion/direccion.module';
import { PedidoModule } from '../pedido/pedido.module';
import { PedidoDetalleModule } from '../pedido-detalle/pedido-detalle.module';
import { PagoModule } from '../pago/pago.module';
import { GetOpenCartByUsuarioUseCase } from './application/use-cases/get-open-cart-by-usuario.use-case';
import { AddItemToCartUseCase } from './application/use-cases/add-item-to-cart.use-case';
import { CheckoutCartUseCase } from './application/use-cases/checkout-cart.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarritoEntityORM]),
    CarritoDetalleModule,
    ProductoModule,
    ClienteModule,
    DireccionModule,
    PedidoModule,
    PedidoDetalleModule,
    PagoModule,
  ],
  controllers: [CarritoController],
  providers: [
    CreateCarritoUseCase,
    UpdateCarritoUseCase,
    DeleteCarritoUseCase,
    GetAllCarritosUseCase,
    GetCarritoByIdUseCase,
    GetOpenCartByUsuarioUseCase,
    AddItemToCartUseCase,
    CheckoutCartUseCase,
    {
      provide: CarritoRepository,
      useClass: CarritoRepositoryImpl,
    },
  ],
  exports: [CarritoRepository],
})
export class CarritoModule {}
