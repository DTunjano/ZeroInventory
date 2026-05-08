import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsuarioRolEntityORM } from './usuario-rol.orm-entity';

@Entity({ name: 'rol' })
export class RolEntityORM {
  @PrimaryGeneratedColumn({ name: 'rol_id' })
  rolId!: number;

  @Column({ name: 'nombre', type: 'varchar', nullable: true })
  nombre!: string | null;

  @OneToMany(() => UsuarioRolEntityORM, (usuarioRol) => usuarioRol.rol)
  usuarioRoles!: UsuarioRolEntityORM[];
}
