import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from './usuario.orm-entity';
import { RolEntity } from './rol.orm-entity';

@Entity({ name: 'usuario_rol' })
export class UsuarioRolEntity {
  @PrimaryGeneratedColumn({ name: 'usuario_rol_id' })
  usuarioRolId!: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId!: number;

  @Column({ name: 'rol_id', type: 'int' })
  rolId!: number;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.usuarioRoles)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UsuarioEntity;

  @ManyToOne(() => RolEntity, (rol) => rol.usuarioRoles)
  @JoinColumn({ name: 'rol_id' })
  rol!: RolEntity;
}
