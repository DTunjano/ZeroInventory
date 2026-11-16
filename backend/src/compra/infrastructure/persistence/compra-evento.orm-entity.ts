import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompraEntityORM } from './compra.orm-entity';
import { UsuarioEntityORM } from '../../../usuario/infrastructure/persistence/usuario.orm-entity';
import type {
  CompraAccion,
  CompraSnapshot,
} from '../../domain/compra-workflow.types';

@Entity('compra_evento')
export class CompraEventoEntityORM {
  @PrimaryGeneratedColumn({ name: 'evento_id' }) eventoId!: number;
  @Column({ name: 'compra_id', type: 'int' }) compraId!: number;
  @Column({ name: 'usuario_id', type: 'int' }) usuarioId!: number;
  @Column({ type: 'varchar', length: 20 }) accion!: CompraAccion;
  @Column({ type: 'int' }) version!: number;
  @Column({ type: 'text', nullable: true }) motivo!: string | null;
  @Column({ type: 'jsonb' }) snapshot!: CompraSnapshot;
  @CreateDateColumn({ type: 'timestamptz' }) fecha!: Date;
  @ManyToOne(() => CompraEntityORM)
  @JoinColumn({ name: 'compra_id' })
  compra!: CompraEntityORM;
  @ManyToOne(() => UsuarioEntityORM)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UsuarioEntityORM;
}
