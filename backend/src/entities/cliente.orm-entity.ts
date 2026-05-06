import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from './usuario.orm-entity';
import { DireccionEntity } from './direccion.orm-entity';
import { PedidoEntity } from './pedido.orm-entity';

export enum TipoDocumentoEnum {
  CC = 'CC',
  CE = 'CE',
  PASAPORTE = 'PASAPORTE',
}

@Entity({ name: 'cliente' })
export class ClienteEntity {
  @PrimaryGeneratedColumn({ name: 'cliente_id' })
  clienteId!: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId!: number;

  @Column({ name: 'tipo_documento', type: 'enum', enum: TipoDocumentoEnum })
  tipoDocumento!: TipoDocumentoEnum;

  @Column({ name: 'documento', type: 'varchar' })
  documento!: string;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.clientes)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UsuarioEntity;

  @OneToMany(() => DireccionEntity, (direccion) => direccion.cliente)
  direcciones!: DireccionEntity[];

  @OneToMany(() => PedidoEntity, (pedido) => pedido.cliente)
  pedidos!: PedidoEntity[];
}
