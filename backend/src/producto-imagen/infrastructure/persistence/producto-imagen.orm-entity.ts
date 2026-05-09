import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductoEntityORM } from '../../../producto/infrastructure/persistence/producto.orm-entity';

@Entity({ name: 'producto_imagen' })
export class ProductoImagenEntityORM {
  @PrimaryGeneratedColumn({ name: 'imagen_producto_id' })
  imagenProductoId!: number;

  @Column({ name: 'producto_id', type: 'int' })
  productoId!: number;

  @Column({ name: 'url', type: 'varchar' })
  url!: string;

  @Column({ name: 'public_id', type: 'varchar', nullable: false })
  publicId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne(() => ProductoEntityORM, (producto) => producto.imagenes)
  @JoinColumn({ name: 'producto_id' })
  producto!: ProductoEntityORM;
}
