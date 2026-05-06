import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PedidoEntity } from './pedido.orm-entity';

export enum MetodoPagoEnum {
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA',
}

export enum EstadoPagoEnum {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

@Entity({ name: 'pago' })
export class PagoEntity {
  @PrimaryGeneratedColumn({ name: 'pago_id' })
  pagoId!: number;

  @Column({ name: 'pedido_id', type: 'int' })
  pedidoId!: number;

  @Column({ name: 'metodo_pago', type: 'enum', enum: MetodoPagoEnum })
  metodoPago!: MetodoPagoEnum;

  @Column({ name: 'monto', precision: 10, scale: 2, type: 'numeric' })
  monto!: number;

  @Column({ name: 'estado', type: 'enum', enum: EstadoPagoEnum })
  estado!: EstadoPagoEnum;

  @CreateDateColumn({ name: 'fecha_pago', type: 'timestamp' })
  fechaPago!: Date;

  @ManyToOne(() => PedidoEntity, (pedido) => pedido.pagos)
  @JoinColumn({ name: 'pedido_id' })
  pedido!: PedidoEntity;
}
