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
import { CompraDetalleEntityORM } from '../../../compra-detalle/infrastructure/persistence/compra-detalle.orm-entity';
import type { CompraEstado } from '../../domain/compra-workflow.types';

@Entity({ name: 'compra' })
export class CompraEntityORM {
  @PrimaryGeneratedColumn({ name: 'compra_id' })
  compraId!: number;

  @Column({ name: 'proveedor_id', type: 'int' })
  proveedorId!: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId!: number;

  @Column({ name: 'total', precision: 14, scale: 2, type: 'numeric' })
  total!: number;

  @CreateDateColumn({ name: 'fecha_compra', type: 'timestamp' })
  fechaCompra!: Date;

  @Column({ type: 'varchar', length: 16, default: 'BORRADOR' }) estado!: CompraEstado;
  @Column({ type: 'int', default: 1 }) version!: number;
  @Column({ type: 'text', nullable: true }) observaciones!: string | null;
  @Column({ name: 'registrada_en', type: 'timestamptz', nullable: true }) registradaEn!: Date | null;
  @Column({ name: 'recibida_por', type: 'int', nullable: true }) recibidaPor!: number | null;
  @Column({ name: 'recibida_en', type: 'timestamptz', nullable: true }) recibidaEn!: Date | null;
  @Column({ name: 'cancelada_por', type: 'int', nullable: true }) canceladaPor!: number | null;
  @Column({ name: 'cancelada_en', type: 'timestamptz', nullable: true }) canceladaEn!: Date | null;
  @Column({ name: 'motivo_cancelacion', type: 'text', nullable: true }) motivoCancelacion!: string | null;
  @ManyToOne(() => UsuarioEntityORM) @JoinColumn({ name: 'recibida_por' }) receptor!: UsuarioEntityORM | null;
  @ManyToOne(() => UsuarioEntityORM) @JoinColumn({ name: 'cancelada_por' }) cancelador!: UsuarioEntityORM | null;

  @ManyToOne(() => ProveedorEntityORM, (proveedor) => proveedor.compras)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor!: ProveedorEntityORM;

  @ManyToOne(() => UsuarioEntityORM, (usuario) => usuario.compras)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UsuarioEntityORM;

  @OneToMany(() => CompraDetalleEntityORM, (detalle) => detalle.compra)
  detalles!: CompraDetalleEntityORM[];
}
