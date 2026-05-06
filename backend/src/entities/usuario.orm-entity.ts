import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClienteEntity } from './cliente.orm-entity';
import { UsuarioRolEntity } from './usuario-rol.orm-entity';
import { CarritoEntity } from './carrito.orm-entity';
import { CompraEntity } from './compra.orm-entity';
import { AjusteInventarioEntity } from './ajuste-inventario.orm-entity';

@Entity({ name: 'usuario' })
export class UsuarioEntity {
  @PrimaryGeneratedColumn({ name: 'usuario_id' })
  usuarioId!: number;

  @Column({ name: 'username', type: 'varchar', unique: true })
  username!: string;

  @Column({ name: 'password', type: 'varchar' })
  password!: string;

  @Column({ name: 'primer_nombre', type: 'varchar', nullable: true })
  primerNombre!: string | null;

  @Column({ name: 'segundo_nombre', type: 'varchar', nullable: true })
  segundoNombre!: string | null;

  @Column({ name: 'primer_apellido', type: 'varchar', nullable: true })
  primerApellido!: string | null;

  @Column({ name: 'segundo_apellido', type: 'varchar', nullable: true })
  segundoApellido!: string | null;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @OneToOne(() => ClienteEntity, (cliente) => cliente.usuario)
  clientes!: ClienteEntity[];

  @OneToMany(() => UsuarioRolEntity, (usuarioRol) => usuarioRol.usuario)
  usuarioRoles!: UsuarioRolEntity[];

  @OneToMany(() => CarritoEntity, (carrito) => carrito.usuario)
  carritos!: CarritoEntity[];

  @OneToMany(() => CompraEntity, (compra) => compra.usuario)
  compras!: CompraEntity[];

  @OneToMany(() => AjusteInventarioEntity, (ajuste) => ajuste.usuario)
  ajustesInventario!: AjusteInventarioEntity[];
}
