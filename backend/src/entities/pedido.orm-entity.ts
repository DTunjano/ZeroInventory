import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClienteEntity } from './cliente.orm-entity';
import { DireccionEntity } from './direccion.orm-entity';
import { PedidoDetalleEntity } from './pedido-detalle.orm-entity';
import { PagoEntity } from './pago.orm-entity';

export enum EstadoPedidoEnum {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  ENVIADO = 'ENVIADO',
  CANCELADO = 'CANCELADO',
}

@Entity({ name: 'pedido' })
export class PedidoEntity {
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

  @ManyToOne(() => ClienteEntity, (cliente) => cliente.pedidos)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: ClienteEntity;

  @ManyToOne(() => DireccionEntity, (direccion) => direccion.pedidos)
  @JoinColumn({ name: 'direccion_id' })
  direccion!: DireccionEntity;

  @OneToMany(() => PedidoDetalleEntity, (detalle) => detalle.pedido)
  detalles!: PedidoDetalleEntity[];

  @OneToMany(() => PagoEntity, (pago) => pago.pedido)
  pagos!: PagoEntity[];
}
