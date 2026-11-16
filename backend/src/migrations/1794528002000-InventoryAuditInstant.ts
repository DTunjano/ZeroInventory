import { MigrationInterface, QueryRunner } from 'typeorm';
export class InventoryAuditInstant1794528002000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(
      'ALTER TABLE ajuste_inventario ADD COLUMN registrado_en timestamptz',
    );
  }
  down(): Promise<void> {
    return Promise.reject(
      new Error(
        'No se descartan fechas de auditoría; restaurar en una base separada',
      ),
    );
  }
}
