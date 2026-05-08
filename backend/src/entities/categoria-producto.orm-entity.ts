import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoriaEntityORM } from './categoria.orm-entity';
import { ProductoORMEntity } from '../producto/infrastructure/persistence/producto.orm-entity';

@Entity({ name: 'categoria_producto' })
export class CategoriaProductoEntityORM {
  @PrimaryGeneratedColumn({ name: 'categoria_producto_id' })
  categoriaProductoId!: number;

  @Column({ name: 'categoria_id', type: 'int' })
  categoriaId!: number;

  @Column({ name: 'producto_id', type: 'int' })
  productoId!: number;

  @ManyToOne(
    () => CategoriaEntityORM,
    (categoria) => categoria.categoriasProducto,
  )
  @JoinColumn({ name: 'categoria_id' })
  categoria!: CategoriaEntityORM;

  @ManyToOne(() => ProductoORMEntity, (producto) => producto.categorias)
  @JoinColumn({ name: 'producto_id' })
  producto!: ProductoORMEntity;
}
