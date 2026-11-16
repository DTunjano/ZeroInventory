import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { PagoEntityORM } from '../../pago/infrastructure/persistence/pago.orm-entity';
import type { WompiStatus } from '../domain/wompi.types';
@Entity('wompi_intento')
export class WompiIntentoEntityORM {
  @PrimaryColumn({ name: 'pago_id', type: 'int' }) pagoId!: number;
  @ManyToOne(() => PagoEntityORM)
  @JoinColumn({ name: 'pago_id' })
  pago!: PagoEntityORM;
  @Column({ name: 'referencia', type: 'varchar', length: 100, unique: true })
  referencia!: string;
  @Column({ name: 'ambiente', type: 'varchar', length: 16 })
  ambiente!: 'sandbox';
  @Column({
    name: 'transaccion_id',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
  })
  transaccionId!: string | null;
  @Column({
    name: 'estado_proveedor',
    type: 'varchar',
    length: 16,
    nullable: true,
  })
  estadoProveedor!: WompiStatus | null;
  @Column({ name: 'creado_en', type: 'timestamptz' }) creadoEn!: Date;
  @Column({ name: 'verificado_en', type: 'timestamptz', nullable: true })
  verificadoEn!: Date | null;
}
