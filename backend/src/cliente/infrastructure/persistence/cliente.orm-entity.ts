import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DireccionEntityORM } from '../../../direccion/infrastructure/persistence/direccion.orm-entity';
import { PedidoEntityORM } from '../../../pedido/infrastructure/persistence/pedido.orm-entity';
import { UsuarioEntityORM } from '../../../usuario/infrastructure/persistence/usuario.orm-entity';

export enum TipoDocumentoEnumORM {
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

  @Column({
    name: 'tipo_documento',
    type: 'enum',
    enum: TipoDocumentoEnumORM,
    nullable: true,
  })
  tipoDocumento!: TipoDocumentoEnumORM;

  @Column({ name: 'documento', type: 'varchar', unique: true })
  documento!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @OneToOne(() => UsuarioEntityORM, (usuario) => usuario.clientes)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UsuarioEntityORM;

  @OneToMany(() => DireccionEntityORM, (direccion) => direccion.cliente)
  direcciones!: DireccionEntityORM[];

  @OneToMany(() => PedidoEntityORM, (pedido) => pedido.cliente)
  pedidos!: PedidoEntityORM[];
}
