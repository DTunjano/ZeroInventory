import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsuarioRolEntityORM } from './usuario-rol.orm-entity';

export enum RolNombreEnum {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  CUSTOMER = 'CUSTOMER',
}

@Entity({ name: 'rol' })
export class RolEntityORM {
  @PrimaryGeneratedColumn({ name: 'rol_id' })
  rolId!: number;

  @Column({ name: 'nombre', type: 'enum', enum: RolNombreEnum })
  nombre!: string | null;

  @OneToMany(() => UsuarioRolEntityORM, (usuarioRol) => usuarioRol.rol)
  usuarioRoles!: UsuarioRolEntityORM[];
}
