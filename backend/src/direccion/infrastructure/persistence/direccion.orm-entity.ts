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
import { ProveedorEntityORM } from '../../../proveedor/infrastructure/persistence/proveedor.orm-entity';

@Entity({ name: 'direccion' })
export class DireccionEntityORM {
  @PrimaryGeneratedColumn({ name: 'direccion_id' })
  direccionId!: number;

  @Column({ name: 'cliente_id', type: 'int', nullable: true })
  clienteId!: number | null;

  @Column({ name: 'proveedor_id', type: 'int', nullable: true })
  proveedorId!: number | null;

  @Column({ name: 'linea_dir', type: 'varchar' })
  lineaDir!: string;

  @Column({ name: 'barrio', type: 'varchar' })
  barrio!: string;

  @Column({ name: 'codigo_postal', type: 'varchar', length: 8, nullable: true })
  codigoPostal!: string | null;

  @Column({ name: 'info_adiccional', type: 'text', nullable: true })
  infoAdiccional!: string | null;

  @Column({ name: 'es_predeterminada', type: 'boolean', default: false })
  esPredeterminada!: boolean;

  @ManyToOne(() => ClienteEntityORM, (cliente) => cliente.direcciones)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: ClienteEntityORM;

  @ManyToOne(() => ProveedorEntityORM, (proveedor) => proveedor.direcciones)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor!: ProveedorEntityORM;

  @OneToMany(() => PedidoEntityORM, (pedido) => pedido.direccion)
  pedidos!: PedidoEntityORM[];
}
