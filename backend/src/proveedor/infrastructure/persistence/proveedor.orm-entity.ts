import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CompraEntityORM } from '../../../compra/infrastructure/persistence/compra.orm-entity';
import { ProductoEntityORM } from '../../../producto/infrastructure/persistence/producto.orm-entity';

@Entity({ name: 'proveedor' })
export class ProveedorEntityORM {
  @PrimaryGeneratedColumn({ name: 'proveedor_id' })
  proveedorId!: number;

  @Column({ name: 'nombre', type: 'varchar' })
  nombre!: string;

  @Column({ name: 'telefono', type: 'varchar', nullable: true })
  telefono!: string | null;

  @Column({ name: 'email', type: 'varchar', nullable: true })
  email!: string | null;

  @OneToMany(() => CompraEntityORM, (compra) => compra.proveedor)
  compras!: CompraEntityORM[];

  @OneToMany(() => ProductoEntityORM, (producto) => producto.proveedor)
  productos!: ProductoEntityORM[];
}
