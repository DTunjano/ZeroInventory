import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CategoriaProductoEntityORM } from '../../../categoria-producto/infrastructure/persistence/categoria-producto.orm-entity';

@Entity({ name: 'categoria' })
export class CategoriaEntityORM {
  @PrimaryGeneratedColumn({ name: 'categoria_id' })
  categoriaId!: number;

  @Column({ name: 'nombre', type: 'varchar', unique: true })
  nombre!: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(
    () => CategoriaProductoEntityORM,
    (categoriaProducto) => categoriaProducto.categoria,
  )
  categoriasProducto!: CategoriaProductoEntityORM[];
}
