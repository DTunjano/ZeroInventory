import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompraEntity } from './compra.orm-entity';
import { ProductoEntity } from './producto.orm-entity';

@Entity({ name: 'compra_detalle' })
export class CompraDetalleEntity {
  @PrimaryGeneratedColumn({ name: 'compra_detalle_id' })
  compraDetalleId!: number;

  @Column({ name: 'compra_id', type: 'int' })
  compraId!: number;

  @Column({ name: 'producto_id', type: 'int' })
  productoId!: number;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad!: number;

  @Column({ name: 'costo_unitario', precision: 10, scale: 2, type: 'numeric' })
  costoUnitario!: number;

  @Column({ name: 'subtotal', precision: 10, scale: 2, type: 'numeric' })
  subtotal!: number;

  @ManyToOne(() => CompraEntity, (compra) => compra.detalles)
  @JoinColumn({ name: 'compra_id' })
  compra!: CompraEntity;

  @ManyToOne(() => ProductoEntity, (producto) => producto.compraDetalles)
  @JoinColumn({ name: 'producto_id' })
  producto!: ProductoEntity;
}
