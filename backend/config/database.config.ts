import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AjusteInventarioEntity } from '../src/entities/ajuste-inventario.orm-entity';
import { CarritoDetalleEntity } from '../src/entities/carrito-detalle.orm-entity';
import { CarritoEntity } from '../src/entities/carrito.orm-entity';
import { CategoriaProductoEntity } from '../src/entities/categoria-producto.orm-entity';
import { CategoriaEntity } from '../src/entities/categoria.orm-entity';
import { ClienteEntity } from '../src/entities/cliente.orm-entity';
import { CompraDetalleEntity } from '../src/entities/compra-detalle.orm-entity';
import { CompraEntity } from '../src/entities/compra.orm-entity';
import { DireccionEntity } from '../src/entities/direccion.orm-entity';
import { KardexEntity } from '../src/entities/kardex.orm-entity';
import { PagoEntity } from '../src/entities/pago.orm-entity';
import { PedidoDetalleEntity } from '../src/entities/pedido-detalle.orm-entity';
import { PedidoEntity } from '../src/entities/pedido.orm-entity';
import { ProductoImagenEntity } from '../src/entities/producto-imagen.orm-entity';
import { ProveedorEntity } from '../src/entities/proveedor.orm-entity';
import { RolEntity } from '../src/entities/rol.orm-entity';
import { UsuarioRolEntity } from '../src/entities/usuario-rol.orm-entity';
import { UsuarioEntity } from '../src/entities/usuario.orm-entity';
import { ProductoORMEntity } from '../src/producto/infrastructure/persistence/producto.orm-entity';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const databaseUrl = process.env.DATABASE_URL;

  const entities = [
    AjusteInventarioEntity,
    CarritoDetalleEntity,
    CarritoEntity,
    CategoriaProductoEntity,
    CategoriaEntity,
    ClienteEntity,
    CompraDetalleEntity,
    CompraEntity,
    DireccionEntity,
    KardexEntity,
    PagoEntity,
    PedidoDetalleEntity,
    PedidoEntity,
    ProductoImagenEntity,
    ProductoORMEntity,
    ProveedorEntity,
    RolEntity,
    UsuarioRolEntity,
    UsuarioEntity,
  ];

  // PRODUCCIÓN
  if (process.env.NODE_ENV === 'production' && databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      entities,
      autoLoadEntities: true,
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }

  // DESARROLLO
  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities,
    autoLoadEntities: true,
    synchronize: true,
  };
});
