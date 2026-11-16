import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { PedidoEntityORM } from './pedido.orm-entity';
import { UsuarioEntityORM } from '../../../usuario/infrastructure/persistence/usuario.orm-entity';
@Entity('pedido_reembolso')
export class PedidoReembolsoEntityORM {
  @PrimaryColumn({ name: 'pedido_id', type: 'int' }) pedidoId!: number;
  @ManyToOne(() => PedidoEntityORM)
  @JoinColumn({ name: 'pedido_id' })
  pedido!: PedidoEntityORM;
  @Column({ type: 'varchar', length: 16 }) estado!: 'PENDIENTE' | 'REGISTRADO';
  @Column({ type: 'numeric', precision: 14, scale: 2 }) monto!: number;
  @Column({ name: 'creada_en', type: 'timestamptz' }) creadaEn!: Date;
  @Column({ name: 'registrada_en', type: 'timestamptz', nullable: true })
  registradaEn!: Date | null;
  @Column({ name: 'registrada_por', type: 'int', nullable: true })
  registradaPor!: number | null;
  @ManyToOne(() => UsuarioEntityORM)
  @JoinColumn({ name: 'registrada_por' })
  usuario!: UsuarioEntityORM | null;
  @Column({ type: 'text', nullable: true }) motivo!: string | null;
}
