import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductoORMEntity } from '../producto/infrastructure/persistence/producto.orm-entity';

@Entity({ name: 'producto_imagen' })
export class ProductoImagenEntity {
  @PrimaryGeneratedColumn({ name: 'imagen_producto_id' })
  imagenProductoId!: number;

  @Column({ name: 'producto_id', type: 'int' })
  productoId!: number;

  @Column({ name: 'url', type: 'varchar' })
  url!: string;

  @ManyToOne(() => ProductoORMEntity, (producto) => producto.imagenes)
  @JoinColumn({ name: 'producto_id' })
  producto!: ProductoORMEntity;
}
