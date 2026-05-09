import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { KardexEntityORM } from '../../../entities/kardex.orm-entity';
import { CategoriaProductoEntityORM } from '../../../entities/categoria-producto.orm-entity';
import { CarritoDetalleEntity } from '../../../entities/carrito-detalle.orm-entity';
import { PedidoDetalleEntityORM } from '../../../entities/pedido-detalle.orm-entity';
import { CompraDetalleEntityORM } from '../../../entities/compra-detalle.orm-entity';
import { AjusteInventarioEntityORM } from '../../../entities/ajuste-inventario.orm-entity';
import { ProductoImagenEntityORM } from '../../../producto-imagen/infrastructure/persistence/producto-imagen.orm-entity';

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

  @OneToMany(() => CarritoDetalleEntity, (detalle) => detalle.producto)
  carritoDetalles!: CarritoDetalleEntity[];

  @OneToMany(() => PedidoDetalleEntityORM, (detalle) => detalle.producto)
  pedidoDetalles!: PedidoDetalleEntityORM[];

  @OneToMany(() => CompraDetalleEntityORM, (detalle) => detalle.producto)
  compraDetalles!: CompraDetalleEntityORM[];

  @OneToMany(() => AjusteInventarioEntityORM, (ajuste) => ajuste.producto)
  ajustesInventario!: AjusteInventarioEntityORM[];
}
