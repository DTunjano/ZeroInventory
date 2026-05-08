import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntityORM } from '../usuario/infrastructure/persistence/usuario.orm-entity';
import { DireccionEntityORM } from './direccion.orm-entity';
import { PedidoEntityORM } from './pedido.orm-entity';

export enum TipoDocumentoEnum {
  CC = 'CC',
  CE = 'CE',
  PASAPORTE = 'PASAPORTE',
}

@Entity({ name: 'cliente' })
export class ClienteEntityORM {
  @PrimaryGeneratedColumn({ name: 'cliente_id' })
  clienteId!: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId!: number;

  @Column({ name: 'tipo_documento', type: 'enum', enum: TipoDocumentoEnum })
  tipoDocumento!: TipoDocumentoEnum;

  @Column({ name: 'documento', type: 'varchar' })
  documento!: string;

  @ManyToOne(() => UsuarioEntityORM, (usuario) => usuario.clientes)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UsuarioEntityORM;

  @OneToMany(() => DireccionEntityORM, (direccion) => direccion.cliente)
  direcciones!: DireccionEntityORM[];

  @OneToMany(() => PedidoEntityORM, (pedido) => pedido.cliente)
  pedidos!: PedidoEntityORM[];
}
