import { MigrationInterface, QueryRunner } from 'typeorm';

export class PurchaseLifecycle1794528000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    // Adopt old headers without claiming they were received or changing stock.
    await q.query(`ALTER TABLE compra
      ADD COLUMN estado varchar(16) NOT NULL DEFAULT 'LEGACY',
      ADD COLUMN version integer NOT NULL DEFAULT 1,
      ADD COLUMN observaciones text,
      ADD COLUMN recibida_por integer REFERENCES usuario(usuario_id),
      ADD COLUMN recibida_en timestamp,
      ADD COLUMN cancelada_por integer REFERENCES usuario(usuario_id),
      ADD COLUMN cancelada_en timestamp,
      ADD COLUMN motivo_cancelacion text,
      ADD CONSTRAINT ck_compra_estado CHECK (estado IN ('BORRADOR','RECIBIDA','CANCELADA','LEGACY')),
      ADD CONSTRAINT ck_compra_version CHECK (version>0),
      ADD CONSTRAINT ck_compra_recepcion CHECK ((estado='RECIBIDA' AND recibida_por IS NOT NULL AND recibida_en IS NOT NULL) OR (estado<>'RECIBIDA' AND recibida_por IS NULL AND recibida_en IS NULL)),
      ADD CONSTRAINT ck_compra_cancelacion CHECK ((estado='CANCELADA' AND cancelada_por IS NOT NULL AND cancelada_en IS NOT NULL AND motivo_cancelacion IS NOT NULL AND length(trim(motivo_cancelacion))>0) OR (estado<>'CANCELADA' AND cancelada_por IS NULL AND cancelada_en IS NULL AND motivo_cancelacion IS NULL))`);
    await q.query(
      `ALTER TABLE compra ALTER COLUMN estado SET DEFAULT 'BORRADOR'`,
    );
    await q.query(`CREATE TABLE compra_evento (
      evento_id SERIAL PRIMARY KEY, compra_id integer NOT NULL REFERENCES compra(compra_id),
      usuario_id integer NOT NULL REFERENCES usuario(usuario_id), accion varchar(20) NOT NULL,
      version integer NOT NULL CHECK (version>0), motivo text, snapshot jsonb NOT NULL,
      fecha timestamp NOT NULL DEFAULT now(),
      CONSTRAINT ck_compra_evento_accion CHECK (accion IN ('CREADA','ACTUALIZADA','RECIBIDA','CANCELADA')),
      CONSTRAINT ck_compra_evento_snapshot CHECK (jsonb_typeof(snapshot)='object'),
      CONSTRAINT uq_compra_evento_version UNIQUE(compra_id,version))`);
    await q.query(
      `CREATE INDEX ix_compra_estado_fecha ON compra(estado,fecha_compra DESC)`,
    );
    await q.query(
      `ALTER TYPE kardex_tipo_referencia_enum ADD VALUE IF NOT EXISTS 'RECEPCION_COMPRA'`,
    );
  }
  down(): Promise<void> {
    return Promise.reject(
      new Error(
        'No se elimina historial de compras: restaurar un respaldo en una base separada',
      ),
    );
  }
}
