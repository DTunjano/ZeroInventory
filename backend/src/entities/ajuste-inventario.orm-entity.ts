import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductoEntity } from './producto.orm-entity';
import { UsuarioEntity } from './usuario.orm-entity';

export enum TipoMovimientoEnum {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE',
}

@Entity({ name: 'ajuste_inventario' })
export class AjusteInventarioEntity {
  @PrimaryGeneratedColumn({ name: 'ajuste_inventario_id' })
  ajusteInventarioId!: number;

  @Column({ name: 'producto_id', type: 'int' })
  productoId!: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId!: number;

  @Column({ name: 'tipo_movimiento', type: 'enum', enum: TipoMovimientoEnum })
  tipoMovimiento!: TipoMovimientoEnum;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad!: number;

  @Column({ name: 'motivo', type: 'text' })
  motivo!: string;

  @CreateDateColumn({ name: 'fecha', type: 'timestamp' })
  fecha!: Date;

  @ManyToOne(() => ProductoEntity, (producto) => producto.ajustesInventario)
  @JoinColumn({ name: 'producto_id' })
  producto!: ProductoEntity;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.ajustesInventario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UsuarioEntity;
}
