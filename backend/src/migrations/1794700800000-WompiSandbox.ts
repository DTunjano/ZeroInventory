import { MigrationInterface, QueryRunner } from 'typeorm';
export class WompiSandbox1794700800000 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query(
      "ALTER TYPE pago_metodo_pago_enum ADD VALUE IF NOT EXISTS 'WOMPI'",
    );
    await q.query(`CREATE TABLE wompi_intento (
      pago_id integer PRIMARY KEY REFERENCES pago(pago_id), referencia varchar(100) NOT NULL UNIQUE,
      ambiente varchar(16) NOT NULL CHECK(ambiente='sandbox'), transaccion_id varchar(100) UNIQUE,
      estado_proveedor varchar(16) CHECK(estado_proveedor IN ('PENDING','APPROVED','DECLINED','VOIDED','ERROR')),
      creado_en timestamptz NOT NULL, verificado_en timestamptz,
      CHECK((transaccion_id IS NULL AND estado_proveedor IS NULL AND verificado_en IS NULL) OR (transaccion_id IS NOT NULL AND estado_proveedor IS NOT NULL AND verificado_en IS NOT NULL)))`);
    await q.query(
      'ALTER TABLE pedido_evento ALTER COLUMN usuario_id DROP NOT NULL',
    );
    await q.query(
      "ALTER TABLE pedido_evento ADD COLUMN origen varchar(16) NOT NULL DEFAULT 'USUARIO' CHECK(origen IN ('USUARIO','WOMPI'))",
    );
    await q.query(
      "ALTER TABLE pedido_evento ADD CONSTRAINT ck_pedido_evento_actor CHECK((origen='USUARIO' AND usuario_id IS NOT NULL) OR (origen='WOMPI' AND usuario_id IS NULL))",
    );
    await q.query(
      'ALTER TABLE pedido_evento DROP CONSTRAINT pedido_evento_accion_check',
    );
    await q.query(
      "ALTER TABLE pedido_evento ADD CONSTRAINT pedido_evento_accion_check CHECK(accion IN ('CREADO','ENVIAR','ENTREGAR','CANCELAR','DEVOLVER','APROBAR_PAGO','RECHAZAR_PAGO','REINTENTAR_PAGO','REGISTRAR_REEMBOLSO','WOMPI_VERIFICADO'))",
    );
  }
  down(): Promise<void> {
    return Promise.reject(
      new Error(
        'Conserva pagos e historial: restaurar respaldo en una base separada',
      ),
    );
  }
}
