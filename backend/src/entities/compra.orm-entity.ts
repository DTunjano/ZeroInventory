import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProveedorEntity } from './proveedor.orm-entity';
import { UsuarioEntity } from './usuario.orm-entity';
import { CompraDetalleEntity } from './compra-detalle.orm-entity';

@Entity({ name: 'compra' })
export class CompraEntity {
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

  @ManyToOne(() => ProveedorEntity, (proveedor) => proveedor.compras)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor!: ProveedorEntity;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.compras)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UsuarioEntity;

  @OneToMany(() => CompraDetalleEntity, (detalle) => detalle.compra)
  detalles!: CompraDetalleEntity[];
}
