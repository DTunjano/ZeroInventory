import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CompraEntity } from './compra.orm-entity';

@Entity({ name: 'proveedor' })
export class ProveedorEntity {
  @PrimaryGeneratedColumn({ name: 'proveedor_id' })
  proveedorId!: number;

  @Column({ name: 'nombre', type: 'varchar' })
  nombre!: string;

  @Column({ name: 'telefono', type: 'varchar', nullable: true })
  telefono!: string | null;

  @Column({ name: 'email', type: 'varchar', nullable: true })
  email!: string | null;

  @OneToMany(() => CompraEntity, (compra) => compra.proveedor)
  compras!: CompraEntity[];
}
