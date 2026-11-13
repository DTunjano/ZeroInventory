import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { EstadoPedidoEnum } from '../../domain/entity/pedido.entity';
import { ClienteEntityORM } from '../../../cliente/infrastructure/persistence/cliente.orm-entity';
import { DireccionEntityORM } from '../../../direccion/infrastructure/persistence/direccion.orm-entity';
import { PagoEntityORM } from '../../../pago/infrastructure/persistence/pago.orm-entity';
import { PedidoDetalleEntityORM } from '../../../pedido-detalle/infrastructure/persistence/pedido-detalle.orm-entity';

@Entity({ name: 'pedido' })
export class PedidoEntityORM {
  @PrimaryGeneratedColumn({ name: 'pedido_id' })
  pedidoId!: number;

  @Column({ name: 'cliente_id', type: 'int' })
  clienteId!: number;

  @Column({ name: 'direccion_id', type: 'int' })
  direccionId!: number;

  @Column({ name: 'estado', type: 'enum', enum: EstadoPedidoEnum })
  estado!: EstadoPedidoEnum;

  @Column({ name: 'total', precision: 14, scale: 2, type: 'numeric' })
  total!: number;

  @Column({ name: 'numero_pedido_usuario', type: 'int', default: 0 })
  numeroPedidoUsuario!: number;

  // Only populated when a historical zero/duplicate was reconciled by migration.
  @Column({ name: 'numero_pedido_usuario_legacy', type: 'int', nullable: true })
  numeroPedidoUsuarioLegacy!: number | null;

  @CreateDateColumn({ name: 'fecha', type: 'timestamp' })
  fecha!: Date;

  @ManyToOne(() => ClienteEntityORM, (cliente) => cliente.pedidos)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: ClienteEntityORM;

  @ManyToOne(() => DireccionEntityORM, (direccion) => direccion.pedidos)
  @JoinColumn({ name: 'direccion_id' })
  direccion!: DireccionEntityORM;

  @OneToMany(() => PedidoDetalleEntityORM, (detalle) => detalle.pedido)
  detalles!: PedidoDetalleEntityORM[];

  @OneToMany(() => PagoEntityORM, (pago) => pago.pedido)
  pagos!: PagoEntityORM[];
}

