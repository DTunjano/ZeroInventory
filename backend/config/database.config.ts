import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AjusteInventarioEntityORM } from '../src/entities/ajuste-inventario.orm-entity';
import { CarritoDetalleEntity } from '../src/entities/carrito-detalle.orm-entity';
import { CarritoEntityORM } from '../src/entities/carrito.orm-entity';
import { CategoriaProductoEntityORM } from '../src/entities/categoria-producto.orm-entity';
import { CategoriaEntityORM } from '../src/entities/categoria.orm-entity';
import { ClienteEntityORM } from '../src/entities/cliente.orm-entity';
import { CompraDetalleEntityORM } from '../src/entities/compra-detalle.orm-entity';
import { CompraEntityORM } from '../src/entities/compra.orm-entity';
import { DireccionEntityORM } from '../src/entities/direccion.orm-entity';
import { KardexEntityORM } from '../src/entities/kardex.orm-entity';
import { PagoEntityORM } from '../src/entities/pago.orm-entity';
import { PedidoDetalleEntityORM } from '../src/entities/pedido-detalle.orm-entity';
import { PedidoEntityORM } from '../src/entities/pedido.orm-entity';
import { ProductoImagenEntityORM } from '../src/entities/producto-imagen.orm-entity';
import { ProveedorEntityORM } from '../src/entities/proveedor.orm-entity';
import { RolEntityORM } from '../src/entities/rol.orm-entity';
import { UsuarioRolEntityORM } from '../src/entities/usuario-rol.orm-entity';
import { UsuarioEntityORM } from '../src/usuario/infrastructure/persistence/usuario.orm-entity';
import { ProductoORMEntity } from '../src/producto/infrastructure/persistence/producto.orm-entity';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const databaseUrl = process.env.DATABASE_URL;

  const entities = [
    AjusteInventarioEntityORM,
    CarritoDetalleEntity,
    CarritoEntityORM,
    CategoriaProductoEntityORM,
    CategoriaEntityORM,
    ClienteEntityORM,
    CompraDetalleEntityORM,
    CompraEntityORM,
    DireccionEntityORM,
    KardexEntityORM,
    PagoEntityORM,
    PedidoDetalleEntityORM,
    PedidoEntityORM,
    ProductoImagenEntityORM,
    ProductoORMEntity,
    ProveedorEntityORM,
    RolEntityORM,
    UsuarioRolEntityORM,
    UsuarioEntityORM,
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
