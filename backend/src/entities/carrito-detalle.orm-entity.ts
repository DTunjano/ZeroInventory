import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CarritoEntityORM } from './carrito.orm-entity';
import { ProductoORMEntity } from '../producto/infrastructure/persistence/producto.orm-entity';

@Entity({ name: 'carrito_detalle' })
export class CarritoDetalleEntity {
  @PrimaryGeneratedColumn({ name: 'carrito_detalle_id' })
  carritoDetalleId!: number;

  @Column({ name: 'carrito_id', type: 'int' })
  carritoId!: number;

  @Column({ name: 'producto_id', type: 'int' })
  productoId!: number;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad!: number;

  @ManyToOne(() => CarritoEntityORM, (carrito) => carrito.detalles)
  @JoinColumn({ name: 'carrito_id' })
  carrito!: CarritoEntityORM;

  @ManyToOne(() => ProductoORMEntity, (producto) => producto.carritoDetalles)
  @JoinColumn({ name: 'producto_id' })
  producto!: ProductoORMEntity;
}
