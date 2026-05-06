import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CategoriaProductoEntity } from './categoria-producto.orm-entity';

@Entity({ name: 'categoria' })
export class CategoriaEntity {
  @PrimaryGeneratedColumn({ name: 'categoria_id' })
  categoriaId!: number;

  @Column({ name: 'nombre', type: 'varchar' })
  nombre!: string;

  @OneToMany(
    () => CategoriaProductoEntity,
    (categoriaProducto) => categoriaProducto.categoria,
  )
  categoriasProducto!: CategoriaProductoEntity[];
}
