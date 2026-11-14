import { MigrationInterface, QueryRunner } from 'typeorm';

export class PurchaseTimestamps1794528001000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    // The preceding lifecycle migration is not released yet. Never infer a zone
    // for operations written with an intermediate development version.
    const [existing] =
      await q.query(`SELECT (SELECT COUNT(*) FROM compra_evento) AS events,
      (SELECT COUNT(*) FROM compra WHERE recibida_en IS NOT NULL OR cancelada_en IS NOT NULL) AS completed`);
    if (Number(existing.events) || Number(existing.completed))
      throw new Error(
        'Existen operaciones de una versión intermedia de compras. Se requiere una conversión explícita de fechas que preserve esos registros; no se borrarán datos',
      );
    await q.query(`ALTER TABLE compra ADD COLUMN registrada_en timestamptz`);
    await q.query(`ALTER TABLE kardex ADD COLUMN registrado_en timestamptz`);
    // All values are NULL by the guard above; old fecha_compra remains unchanged.
    await q.query(`ALTER TABLE compra ALTER COLUMN recibida_en TYPE timestamptz USING recibida_en AT TIME ZONE 'America/Bogota',
      ALTER COLUMN cancelada_en TYPE timestamptz USING cancelada_en AT TIME ZONE 'America/Bogota'`);
    await q.query(
      `ALTER TABLE compra_evento ALTER COLUMN fecha TYPE timestamptz USING fecha AT TIME ZONE 'UTC'`,
    );
  }
  down(): Promise<void> {
    return Promise.reject(
      new Error(
        'No se descartan instantes de auditoría: restaurar en una base separada',
      ),
    );
  }
}
