import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClienteEntityORM } from '../../../cliente/infrastructure/persistence/cliente.orm-entity';
import { PedidoEntityORM } from '../../../pedido/infrastructure/persistence/pedido.orm-entity';

@Entity({ name: 'direccion' })
export class DireccionEntityORM {
  @PrimaryGeneratedColumn({ name: 'direccion_id' })
  direccionId!: number;

  @Column({ name: 'cliente_id', type: 'int' })
  clienteId!: number;

  @Column({ name: 'linea_dir', type: 'varchar' })
  lineaDir!: string;

  @Column({ name: 'barrio', type: 'varchar' })
  barrio!: string;

  @Column({ name: 'codigo_postal', type: 'varchar', length: 8, nullable: true })
  codigoPostal!: string | null;

  @Column({ name: 'info_adiccional', type: 'text', nullable: true })
  infoAdiccional!: string | null;

  @ManyToOne(() => ClienteEntityORM, (cliente) => cliente.direcciones)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: ClienteEntityORM;

  @OneToMany(() => PedidoEntityORM, (pedido) => pedido.direccion)
  pedidos!: PedidoEntityORM[];
}
