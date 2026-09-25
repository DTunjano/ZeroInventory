import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsuarioRolEntityORM } from '../../../usuario-rol/infrastructure/persistence/usuario-rol.orm-entity';
import { RolNombreEnum } from '../../domain/entity/rol.entity';

@Entity({ name: 'rol' })
export class RolEntityORM {
  @PrimaryGeneratedColumn({ name: 'rol_id' })
  rolId!: number;

  @Column({ name: 'nombre', type: 'enum', enum: RolNombreEnum })
  nombre!: RolNombreEnum;

  @OneToMany(() => UsuarioRolEntityORM, (usuarioRol) => usuarioRol.rol)
  usuarioRoles!: UsuarioRolEntityORM[];
}
