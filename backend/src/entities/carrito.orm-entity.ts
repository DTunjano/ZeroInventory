import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntityORM } from '../usuario/infrastructure/persistence/usuario.orm-entity';
import { CarritoDetalleEntity } from './carrito-detalle.orm-entity';

export enum EstadoCarritoEnum {
  ABIERTO = 'ABIERTO',
  CERRADO = 'CERRADO',
}

@Entity({ name: 'carrito' })
export class CarritoEntityORM {
  @PrimaryGeneratedColumn({ name: 'carrito_id' })
  carritoId!: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId!: number;

  @Column({ name: 'estado', type: 'enum', enum: EstadoCarritoEnum })
  estado!: EstadoCarritoEnum;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @OneToOne(() => UsuarioEntityORM, (usuario) => usuario.carritos)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UsuarioEntityORM;

  @OneToMany(() => CarritoDetalleEntity, (detalle) => detalle.carrito)
  detalles!: CarritoDetalleEntity[];
}
