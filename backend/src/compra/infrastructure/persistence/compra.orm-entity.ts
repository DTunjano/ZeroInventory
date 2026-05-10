import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProveedorEntityORM } from '../../../proveedor/infrastructure/persistence/proveedor.orm-entity';
import { UsuarioEntityORM } from '../../../usuario/infrastructure/persistence/usuario.orm-entity';
import { CompraDetalleEntityORM } from '../../../entities/compra-detalle.orm-entity';

@Entity({ name: 'compra' })
export class CompraEntityORM {
  @PrimaryGeneratedColumn({ name: 'compra_id' })
  compraId!: number;

  @Column({ name: 'proveedor_id', type: 'int' })
  proveedorId!: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId!: number;

  @Column({ name: 'total', precision: 10, scale: 2, type: 'numeric' })
  total!: number;

  @CreateDateColumn({ name: 'fecha_compra', type: 'timestamp' })
  fechaCompra!: Date;

  @ManyToOne(() => ProveedorEntityORM, (proveedor) => proveedor.compras)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor!: ProveedorEntityORM;

  @ManyToOne(() => UsuarioEntityORM, (usuario) => usuario.compras)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UsuarioEntityORM;

  @OneToMany(() => CompraDetalleEntityORM, (detalle) => detalle.compra)
  detalles!: CompraDetalleEntityORM[];
}
