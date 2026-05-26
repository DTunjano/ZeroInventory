import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntityORM } from '../usuario/infrastructure/persistence/usuario.orm-entity';
import { ProductoEntityORM } from '../producto/infrastructure/persistence/producto.orm-entity';

export enum TipoMovimientoEnum {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE',
}

export enum TipoCambioEnum {
  AUMENTO = 'AUMENTO',
  REDUCCION = 'REDUCCION',
}

@Entity({ name: 'ajuste_inventario' })
export class AjusteInventarioEntityORM {
  @PrimaryGeneratedColumn({ name: 'ajuste_inventario_id' })
  ajusteInventarioId!: number;

  @Column({ name: 'producto_id', type: 'int' })
  productoId!: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId!: number;

  @Column({
    name: 'tipo_movimiento',
    type: 'enum',
    enum: TipoMovimientoEnum,
    default: TipoMovimientoEnum.AJUSTE,
    nullable: true,
  })
  tipoMovimiento!: TipoMovimientoEnum;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad!: number;

  @Column({ name: 'stock_anterior', type: 'int', nullable: true })
  stockAnterior?: number;

  @Column({ name: 'stock_nuevo', type: 'int', nullable: true })
  stockNuevo?: number;

  @Column({ name: 'tipo_cambio', type: 'enum', enum: TipoCambioEnum, nullable: true })
  tipoCambio?: TipoCambioEnum;

  @Column({ name: 'motivo', type: 'text' })
  motivo!: string;

  @CreateDateColumn({ name: 'fecha', type: 'timestamp' })
  fecha!: Date;

  @ManyToOne(() => ProductoEntityORM, (producto) => producto.ajustesInventario)
  @JoinColumn({ name: 'producto_id' })
  producto!: ProductoEntityORM;

  @ManyToOne(() => UsuarioEntityORM, (usuario) => usuario.ajustesInventario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UsuarioEntityORM;
}
