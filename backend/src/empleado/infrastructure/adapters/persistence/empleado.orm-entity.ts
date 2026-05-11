import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'empleado' })
export class EmpleadoEntityORM {
  @PrimaryGeneratedColumn({ name: 'empleado_id' })
  empleadoId!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre!: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'estado', type: 'varchar', length: 20 })
  estado!: string;

  @Column({ name: 'usuario_id', type: 'int', nullable: true })
  usuarioId!: number | null;

  @Column({ name: 'telefono', type: 'varchar', length: 20, nullable: true })
  telefono!: string | null;

  @Column({ name: 'documento', type: 'varchar', length: 50, nullable: true, unique: true })
  documento!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
