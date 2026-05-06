import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from './usuario.orm-entity';
import { CarritoDetalleEntity } from './carrito-detalle.orm-entity';

export enum EstadoCarritoEnum {
  ABIERTO = 'ABIERTO',
  CERRADO = 'CERRADO',
}

@Entity({ name: 'carrito' })
export class CarritoEntity {
  @PrimaryGeneratedColumn({ name: 'carrito_id' })
  carritoId!: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId!: number;

  @Column({ name: 'estado', type: 'enum', enum: EstadoCarritoEnum })
  estado!: EstadoCarritoEnum;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.carritos)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UsuarioEntity;

  @OneToMany(() => CarritoDetalleEntity, (detalle) => detalle.carrito)
  detalles!: CarritoDetalleEntity[];
}
