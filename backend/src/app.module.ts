import { Module } from '@nestjs/common';
import databaseConfig from '../config/database.config';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { CloudinaryModule } from '../infrastructure/cloudinary/cloudinary.module';
import { ProductoModule } from './producto/producto.module';
import { UsuarioModule } from './usuario/usuario.module';
import { ClienteModule } from './cliente/cliente.module';
import { ProductoImagenModule } from './producto-imagen/producto-imagen.module';
import { CategoriaModule } from './categoria/categoria.module';
import { CategoriaProductoModule } from './categoria-producto/categoria-producto.module';
import { DireccionModule } from './direccion/direccion.module';
import { PedidoModule } from './pedido/pedido.module';
import { PagoModule } from './pago/pago.module';
import { PedidoDetalleModule } from './pedido-detalle/pedido-detalle.module';
import { RolModule } from './rol/rol.module';
import { UsuarioRolModule } from './usuario-rol/usuario-rol.module';
import { CarritoModule } from './carrito/carrito.module';
import { CarritoDetalleModule } from './carrito-detalle/carrito-detalle.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { CompraModule } from './compra/compra.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      load: [databaseConfig],
    }),
    DatabaseModule,
    CloudinaryModule,
    ProductoModule,
    UsuarioModule,
    ClienteModule,
    ProductoImagenModule,
    CategoriaModule,
    CategoriaProductoModule,
    DireccionModule,
    PedidoModule,
    PagoModule,
    PedidoDetalleModule,
    RolModule,
    UsuarioRolModule,
    CarritoModule,
    CarritoDetalleModule,
    ProveedorModule,
    CompraModule,
  ],
})
export class AppModule {}
