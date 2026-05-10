import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UsuarioRolEntityORM } from '../../../usuario-rol/infrastructure/persistence/usuario-rol.orm-entity';
import { CarritoEntityORM } from '../../../carrito/infrastructure/persistence/carrito.orm-entity';
import { ClienteEntityORM } from '../../../cliente/infrastructure/persistence/cliente.orm-entity';
import { CompraEntityORM } from '../../../compra/infrastructure/persistence/compra.orm-entity';
import { AjusteInventarioEntityORM } from '../../../ajuste-inventario/infrastructure/persistence/ajuste-inventario.orm-entity';

@Entity({ name: 'usuario' })
export class UsuarioEntityORM {
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

  @OneToOne(() => ClienteEntityORM, (cliente) => cliente.usuario)
  clientes!: ClienteEntityORM[];

  @OneToMany(() => UsuarioRolEntityORM, (usuarioRol) => usuarioRol.usuario)
  usuarioRoles!: UsuarioRolEntityORM[];

  @OneToMany(() => CarritoEntityORM, (carrito) => carrito.usuario)
  carritos!: CarritoEntityORM[];

  @OneToMany(() => CompraEntityORM, (compra) => compra.usuario)
  compras!: CompraEntityORM[];

  @OneToMany(() => AjusteInventarioEntityORM, (ajuste) => ajuste.usuario)
  ajustesInventario!: AjusteInventarioEntityORM[];
}
