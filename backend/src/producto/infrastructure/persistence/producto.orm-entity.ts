import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { KardexEntityORM } from '../../../entities/kardex.orm-entity';
import { CategoriaProductoEntityORM } from '../../../categoria-producto/infrastructure/persistence/categoria-producto.orm-entity';
import { CarritoDetalleEntityORM } from '../../../carrito-detalle/infrastructure/persistence/carrito-detalle.orm-entity';
import { ProductoImagenEntityORM } from '../../../producto-imagen/infrastructure/persistence/producto-imagen.orm-entity';
import { PedidoDetalleEntityORM } from '../../../pedido-detalle/infrastructure/persistence/pedido-detalle.orm-entity';
import { AjusteInventarioEntityORM } from '../../../ajuste-inventario/infrastructure/persistence/ajuste-inventario.orm-entity';
import { CompraDetalleEntityORM } from '../../../compra-detalle/infrastructure/persistence/compra-detalle.orm-entity';

@Entity({ name: 'producto' })
export class ProductoEntityORM {
  @PrimaryGeneratedColumn({ name: 'producto_id' })
  productoId!: number;

  @Column({ name: 'nombre', type: 'varchar' })
  nombre!: string;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad!: number;

  @Column({ name: 'precio', precision: 10, scale: 2, type: 'numeric' })
  precio!: number;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ name: 'sku', type: 'varchar', unique: true })
  sku!: string;

  @Column({ name: 'marca', type: 'varchar', nullable: true })
  marca!: string | null;

  @Column({ name: 'material', type: 'varchar', nullable: true })
  material!: string | null;

  @Column({ name: 'peso', type: 'varchar', nullable: true })
  peso!: string | null;

  @Column({ name: 'medida', type: 'varchar', nullable: true })
  medida!: string | null;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive!: boolean;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => KardexEntityORM, (kardex) => kardex.producto)
  kardexMovimientos!: KardexEntityORM[];

  @OneToMany(() => ProductoImagenEntityORM, (imagen) => imagen.producto)
  imagenes!: ProductoImagenEntityORM[];

  @OneToMany(
    () => CategoriaProductoEntityORM,
    (categoriaProducto) => categoriaProducto.producto,
  )
  categorias!: CategoriaProductoEntityORM[];

  @OneToMany(() => CarritoDetalleEntityORM, (detalle) => detalle.producto)
  carritoDetalles!: CarritoDetalleEntityORM[];

  @OneToMany(() => PedidoDetalleEntityORM, (detalle) => detalle.producto)
  pedidoDetalles!: PedidoDetalleEntityORM[];

  @OneToMany(() => CompraDetalleEntityORM, (detalle) => detalle.producto)
  compraDetalles!: CompraDetalleEntityORM[];

  @OneToMany(() => AjusteInventarioEntityORM, (ajuste) => ajuste.producto)
  ajustesInventario!: AjusteInventarioEntityORM[];
}
