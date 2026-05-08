import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PedidoEntityORM } from './pedido.orm-entity';
import { ProductoORMEntity } from '../producto/infrastructure/persistence/producto.orm-entity';

@Entity({ name: 'pedido_detalle' })
export class PedidoDetalleEntityORM {
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

  @ManyToOne(() => PedidoEntityORM, (pedido) => pedido.detalles)
  @JoinColumn({ name: 'pedido_id' })
  pedido!: PedidoEntityORM;

  @ManyToOne(() => ProductoORMEntity, (producto) => producto.pedidoDetalles)
  @JoinColumn({ name: 'producto_id' })
  producto!: ProductoORMEntity;
}
