import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { KardexEntity } from './kardex.orm-entity';
import { ProductoImagenEntity } from './producto-imagen.orm-entity';
import { CategoriaProductoEntity } from './categoria-producto.orm-entity';
import { CarritoDetalleEntity } from './carrito-detalle.orm-entity';
import { PedidoDetalleEntity } from './pedido-detalle.orm-entity';
import { CompraDetalleEntity } from './compra-detalle.orm-entity';
import { AjusteInventarioEntity } from './ajuste-inventario.orm-entity';

@Entity({ name: 'producto' })
export class ProductoEntity {
  @PrimaryGeneratedColumn({ name: 'producto_id' })
  productoId!: number;

  @Column({ name: 'nombre', type: 'varchar' })
  nombre!: string;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad!: number;

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

  @OneToMany(() => KardexEntity, (kardex) => kardex.producto)
  kardexMovimientos!: KardexEntity[];

  @OneToMany(() => ProductoImagenEntity, (imagen) => imagen.producto)
  imagenes!: ProductoImagenEntity[];

  @OneToMany(
    () => CategoriaProductoEntity,
    (categoriaProducto) => categoriaProducto.producto,
  )
  categorias!: CategoriaProductoEntity[];

  @OneToMany(() => CarritoDetalleEntity, (detalle) => detalle.producto)
  carritoDetalles!: CarritoDetalleEntity[];

  @OneToMany(() => PedidoDetalleEntity, (detalle) => detalle.producto)
  pedidoDetalles!: PedidoDetalleEntity[];

  @OneToMany(() => CompraDetalleEntity, (detalle) => detalle.producto)
  compraDetalles!: CompraDetalleEntity[];

  @OneToMany(() => AjusteInventarioEntity, (ajuste) => ajuste.producto)
  ajustesInventario!: AjusteInventarioEntity[];
}
