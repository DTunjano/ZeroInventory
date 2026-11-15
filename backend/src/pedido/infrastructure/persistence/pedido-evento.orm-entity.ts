import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PedidoEntityORM } from './pedido.orm-entity';
import { UsuarioEntityORM } from '../../../usuario/infrastructure/persistence/usuario.orm-entity';
import type {
  PedidoAction,
  PedidoSnapshot,
} from '../../domain/pedido-workflow.types';
@Entity('pedido_evento')
export class PedidoEventoEntityORM {
  @PrimaryGeneratedColumn({ name: 'evento_id' }) eventoId!: number;
  @Column({ name: 'pedido_id', type: 'int' }) pedidoId!: number;
  @ManyToOne(() => PedidoEntityORM)
  @JoinColumn({ name: 'pedido_id' })
  pedido!: PedidoEntityORM;
  @Column({ name: 'usuario_id', type: 'int' }) usuarioId!: number;
  @ManyToOne(() => UsuarioEntityORM)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UsuarioEntityORM;
  @Column({ type: 'int' }) version!: number;
  @Column({ type: 'varchar', length: 32 }) accion!: PedidoAction | 'CREADO';
  @Column({ type: 'text' }) motivo!: string;
  @Column({ type: 'jsonb' }) solicitud!: { pagoId?: number };
  @Column({ type: 'jsonb' }) snapshot!: PedidoSnapshot;
  @Column({ type: 'timestamptz' }) fecha!: Date;
}
