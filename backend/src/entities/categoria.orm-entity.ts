import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CategoriaProductoEntityORM } from './categoria-producto.orm-entity';

@Entity({ name: 'categoria' })
export class CategoriaEntityORM {
  @PrimaryGeneratedColumn({ name: 'categoria_id' })
  categoriaId!: number;

  @Column({ name: 'nombre', type: 'varchar' })
  nombre!: string;

  @OneToMany(
    () => CategoriaProductoEntityORM,
    (categoriaProducto) => categoriaProducto.categoria,
  )
  categoriasProducto!: CategoriaProductoEntityORM[];
}
