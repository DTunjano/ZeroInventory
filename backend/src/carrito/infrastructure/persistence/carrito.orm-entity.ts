import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoCarritoEnum } from '../../domain/entity/carrito.entity';
import { UsuarioEntityORM } from '../../../usuario/infrastructure/persistence/usuario.orm-entity';
import { CarritoDetalleEntityORM } from '../../../carrito-detalle/infrastructure/persistence/carrito-detalle.orm-entity';

@Entity({ name: 'carrito' })
export class CarritoEntityORM {
  @PrimaryGeneratedColumn({ name: 'carrito_id' })
  carritoId!: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId!: number;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoCarritoEnum,
    default: EstadoCarritoEnum.ABIERTO,
  })
  estado!: EstadoCarritoEnum;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne(() => UsuarioEntityORM, (usuario) => usuario.carritos)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UsuarioEntityORM;

  @OneToMany(() => CarritoDetalleEntityORM, (detalle) => detalle.carrito)
  detalles!: CarritoDetalleEntityORM[];
}
