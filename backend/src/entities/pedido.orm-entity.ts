import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DireccionEntityORM } from './direccion.orm-entity';
import { PedidoDetalleEntityORM } from './pedido-detalle.orm-entity';
import { PagoEntityORM } from './pago.orm-entity';
import { ClienteEntityORM } from '../cliente/infrastructure/persistence/cliente.orm-entity';

export enum EstadoPedidoEnum {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  ENVIADO = 'ENVIADO',
  CANCELADO = 'CANCELADO',
}

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

  @Column({ name: 'total', precision: 10, scale: 2, type: 'numeric' })
  total!: number;

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
