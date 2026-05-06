import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PedidoEntity } from './pedido.orm-entity';
import { ProductoEntity } from './producto.orm-entity';

@Entity({ name: 'pedido_detalle' })
export class PedidoDetalleEntity {
  @PrimaryGeneratedColumn({ name: 'pedido_detalle_id' })
  pedidoDetalleId!: number;

  @Column({ name: 'pedido_id', type: 'int' })
  pedidoId!: number;

  @Column({ name: 'producto_id', type: 'int' })
  productoId!: number;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad!: number;

  @Column({ name: 'precio_unitario', precision: 10, scale: 2, type: 'numeric' })
  precioUnitario!: number;

  @Column({ name: 'subtotal', precision: 10, scale: 2, type: 'numeric' })
  subtotal!: number;

  @ManyToOne(() => PedidoEntity, (pedido) => pedido.detalles)
  @JoinColumn({ name: 'pedido_id' })
  pedido!: PedidoEntity;

  @ManyToOne(() => ProductoEntity, (producto) => producto.pedidoDetalles)
  @JoinColumn({ name: 'producto_id' })
  producto!: ProductoEntity;
}
