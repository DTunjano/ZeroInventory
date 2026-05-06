import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsuarioRolEntity } from './usuario-rol.orm-entity';

@Entity({ name: 'rol' })
export class RolEntity {
  @PrimaryGeneratedColumn({ name: 'rol_id' })
  rolId!: number;

  @Column({ name: 'nombre', type: 'varchar', nullable: true })
  nombre!: string | null;

  @OneToMany(() => UsuarioRolEntity, (usuarioRol) => usuarioRol.rol)
  usuarioRoles!: UsuarioRolEntity[];
}
