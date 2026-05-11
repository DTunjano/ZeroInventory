import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductoEntityORM } from '../../../producto/infrastructure/persistence/producto.orm-entity';
import {
  TipoMovimientoEnum,
  TipoReferenciaEnum,
} from '../../domain/entity/kardex.entity';

@Entity({ name: 'kardex' })
export class KardexEntityORM {
  @PrimaryGeneratedColumn({ name: 'kardex_id' })
  kardexId!: number;

  @Column({ name: 'producto_id', type: 'int' })
  productoId!: number;

  @ManyToOne(() => ProductoEntityORM, (producto) => producto.kardexMovimientos)
  @JoinColumn({ name: 'producto_id' })
  producto?: ProductoEntityORM;

  @Column({ name: 'tipo_movimiento', type: 'enum', enum: TipoMovimientoEnum })
  tipoMovimiento!: TipoMovimientoEnum;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad!: number;

  @Column({ name: 'costo_unitario', precision: 10, scale: 2, type: 'numeric' })
  costoUnitario!: number;

  @Column({ name: 'valor_total', precision: 10, scale: 2, type: 'numeric' })
  valorTotal!: number;

  @Column({ name: 'referencia_id', type: 'int' })
  referenciaId!: number;

  @Column({ name: 'tipo_referencia', type: 'enum', enum: TipoReferenciaEnum })
  tipoReferencia!: TipoReferenciaEnum;

  @CreateDateColumn({ name: 'fecha_movimiento', type: 'timestamp' })
  fechaMovimiento!: Date;
}
