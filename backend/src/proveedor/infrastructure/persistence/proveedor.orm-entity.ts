import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CompraEntityORM } from '../../../compra/infrastructure/persistence/compra.orm-entity';
import { ProductoEntityORM } from '../../../producto/infrastructure/persistence/producto.orm-entity';
import { DireccionEntityORM } from '../../../direccion/infrastructure/persistence/direccion.orm-entity';
import { AjusteInventarioEntityORM } from '../../../ajuste-inventario/infrastructure/persistence/ajuste-inventario.orm-entity';

@Entity({ name: 'proveedor' })
export class ProveedorEntityORM {
  @PrimaryGeneratedColumn({ name: 'proveedor_id' })
  proveedorId!: number;

  @Column({ name: 'nombre', type: 'varchar' })
  nombre!: string;

  @Column({ name: 'nombre_titular', type: 'varchar', nullable: true })
  nombreTitular!: string | null;

  @Column({ name: 'telefono', type: 'varchar', nullable: true })
  telefono!: string | null;

  @Column({ name: 'email', type: 'varchar', nullable: true })
  email!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => CompraEntityORM, (compra) => compra.proveedor)
  compras!: CompraEntityORM[];

  @OneToMany(() => ProductoEntityORM, (producto) => producto.proveedor)
  productos!: ProductoEntityORM[];

  @OneToMany(() => DireccionEntityORM, (direccion) => direccion.proveedor)
  direcciones!: DireccionEntityORM[];

  @OneToMany(() => AjusteInventarioEntityORM, (ajuste) => ajuste.producto)
  ajustesInventario!: AjusteInventarioEntityORM[];
}
