import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CarritoEntityORM } from '../../../carrito/infrastructure/persistence/carrito.orm-entity';
import { ProductoEntityORM } from '../../../producto/infrastructure/persistence/producto.orm-entity';

@Entity({ name: 'carrito_detalle' })
export class CarritoDetalleEntityORM {
  @PrimaryGeneratedColumn({ name: 'carrito_detalle_id' })
  carritoDetalleId!: number;

  @Column({ name: 'carrito_id', type: 'int' })
  carritoId!: number;

  @Column({ name: 'producto_id', type: 'int' })
  productoId!: number;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne(() => CarritoEntityORM, (carrito) => carrito.detalles)
  @JoinColumn({ name: 'carrito_id' })
  carrito!: CarritoEntityORM;

  @ManyToOne(() => ProductoEntityORM, (producto) => producto.carritoDetalles)
  @JoinColumn({ name: 'producto_id' })
  producto!: ProductoEntityORM;
}
