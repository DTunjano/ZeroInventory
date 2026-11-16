import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

/**
 * ORM Entity para la tabla media
 * Mapea la estructura de datos de la base de datos
 */
@Entity('media')
export class MediaOrmEntity {
  @PrimaryGeneratedColumn('increment')
  mediaId!: number

  @Column({ type: 'varchar', length: 50 })
  tipo!: 'video' | 'image'

  @Column({ type: 'varchar', length: 150 })
  titulo!: string

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null

  @Column({ type: 'text' })
  url!: string

  @Column({ type: 'varchar', length: 255 })
  publicId!: string

  @Column({ type: 'varchar', length: 20, default: 'activo' })
  estado!: 'activo' | 'inactivo'

  @Column({ type: 'int', default: 0 })
  orden!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
