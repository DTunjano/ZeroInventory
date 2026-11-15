import { MigrationInterface, QueryRunner } from 'typeorm';
export class OrderLifecycle1794614400000 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query(
      `ALTER TABLE pedido ADD COLUMN version integer NOT NULL DEFAULT 0 CHECK(version>=0), ADD COLUMN registrada_en timestamptz`,
    );
    await q.query(
      `ALTER TABLE pago ADD COLUMN registrado_en timestamptz,ADD COLUMN decidido_en timestamptz`,
    );
    await q.query(`CREATE TABLE pedido_evento (
      evento_id SERIAL PRIMARY KEY,pedido_id integer NOT NULL REFERENCES pedido(pedido_id),usuario_id integer NOT NULL REFERENCES usuario(usuario_id),
      version integer NOT NULL CHECK(version>0),accion varchar(32) NOT NULL CHECK(accion IN ('CREADO','ENVIAR','ENTREGAR','CANCELAR','DEVOLVER','APROBAR_PAGO','RECHAZAR_PAGO','REINTENTAR_PAGO','REGISTRAR_REEMBOLSO')),
      motivo text NOT NULL CHECK(length(trim(motivo))>0),solicitud jsonb NOT NULL,snapshot jsonb NOT NULL,
      fecha timestamptz NOT NULL,CONSTRAINT uq_pedido_evento_version UNIQUE(pedido_id,version),
      CHECK(jsonb_typeof(solicitud)='object'),CHECK(jsonb_typeof(snapshot)='object'))`);
    await q.query(`CREATE TABLE pedido_reembolso (
      pedido_id integer PRIMARY KEY REFERENCES pedido(pedido_id),estado varchar(16) NOT NULL CHECK(estado IN ('PENDIENTE','REGISTRADO')),
      monto numeric(14,2) NOT NULL CHECK(monto>0),creada_en timestamptz NOT NULL,registrada_en timestamptz,
      registrada_por integer REFERENCES usuario(usuario_id),motivo text,
      CHECK((estado='PENDIENTE' AND registrada_en IS NULL AND registrada_por IS NULL AND motivo IS NULL) OR (estado='REGISTRADO' AND registrada_en IS NOT NULL AND registrada_por IS NOT NULL AND motivo IS NOT NULL AND length(trim(motivo))>0)))`);
    await q.query(
      `ALTER TYPE pago_estado_enum ADD VALUE IF NOT EXISTS 'ANULADO'`,
    );
    await q.query(
      `ALTER TYPE kardex_tipo_referencia_enum ADD VALUE IF NOT EXISTS 'CANCELACION_PEDIDO'`,
    );
    await q.query(
      `ALTER TYPE kardex_tipo_referencia_enum ADD VALUE IF NOT EXISTS 'DEVOLUCION_PEDIDO'`,
    );
  }
  down(): Promise<void> {
    return Promise.reject(
      new Error(
        'No se borra historial de pedidos: restaurar respaldo en una base separada',
      ),
    );
  }
}
