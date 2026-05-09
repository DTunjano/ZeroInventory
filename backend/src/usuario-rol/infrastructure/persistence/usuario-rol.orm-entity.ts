import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntityORM } from '../../../usuario/infrastructure/persistence/usuario.orm-entity';
import { RolEntityORM } from '../../../rol/infrastructure/persistence/rol.orm-entity';

@Entity({ name: 'usuario_rol' })
export class UsuarioRolEntityORM {
  @PrimaryGeneratedColumn({ name: 'usuario_rol_id' })
  usuarioRolId!: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId!: number;

  @Column({ name: 'rol_id', type: 'int' })
  rolId!: number;

  @ManyToOne(() => UsuarioEntityORM, (usuario) => usuario.usuarioRoles)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UsuarioEntityORM;

  @ManyToOne(() => RolEntityORM, (rol) => rol.usuarioRoles)
  @JoinColumn({ name: 'rol_id' })
  rol!: RolEntityORM;
}
