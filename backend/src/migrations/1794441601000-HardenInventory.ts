import { MigrationInterface, QueryRunner } from 'typeorm';

export class HardenInventory1794441601000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    for (const [table, columns] of Object.entries({
      producto: ['precio'], compra: ['total'], compra_detalle: ['costo_unitario', 'subtotal'],
      pedido: ['total'], pedido_detalle: ['precio_unitario', 'subtotal'], pago: ['monto'],
      kardex: ['costo_unitario', 'valor_total'],
    })) {
      for (const column of columns) {
        await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE numeric(14,2)`);
      }
    }
    if (await queryRunner.hasColumn('ajuste_inventario', 'tipo_movimiento')) {
      await queryRunner.query(`UPDATE ajuste_inventario SET tipo_movimiento = 'AJUSTE' WHERE tipo_movimiento IS NULL`);
      await queryRunner.query(`ALTER TABLE ajuste_inventario ALTER COLUMN tipo_movimiento SET DEFAULT 'AJUSTE'`);
    }
    // Preserve old identifiers when reconciling historical zero/duplicate numbers.
    await queryRunner.query(`ALTER TABLE pedido ADD COLUMN IF NOT EXISTS numero_pedido_usuario_legacy integer`);
    await queryRunner.query(`
      WITH ranked AS (
        SELECT pedido_id,cliente_id,numero_pedido_usuario,
          ROW_NUMBER() OVER(PARTITION BY cliente_id,numero_pedido_usuario ORDER BY pedido_id) AS duplicate_rank,
          GREATEST(MAX(numero_pedido_usuario) OVER(PARTITION BY cliente_id),0) AS last_number
        FROM pedido
      ), replacements AS (
        SELECT pedido_id,numero_pedido_usuario,
          last_number + ROW_NUMBER() OVER(PARTITION BY cliente_id ORDER BY pedido_id) AS next_number
        FROM ranked WHERE numero_pedido_usuario <= 0 OR duplicate_rank > 1
      )
      UPDATE pedido p SET numero_pedido_usuario_legacy=r.numero_pedido_usuario,
        numero_pedido_usuario=r.next_number
      FROM replacements r WHERE p.pedido_id=r.pedido_id`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_pedido_cliente_numero ON pedido (cliente_id, numero_pedido_usuario)`);
    await queryRunner.query(`ALTER TABLE producto ADD CONSTRAINT ck_producto_stock_nonnegative CHECK (cantidad >= 0)`);
    await queryRunner.query(`ALTER TABLE carrito_detalle ADD CONSTRAINT ck_carrito_detalle_positive CHECK (cantidad > 0)`);
    await queryRunner.query(`ALTER TABLE pedido_detalle ADD CONSTRAINT ck_pedido_detalle_positive CHECK (cantidad > 0)`);
    await queryRunner.query(`ALTER TABLE kardex ADD CONSTRAINT ck_kardex_positive CHECK (cantidad > 0)`);
    // Preserve all historical movements. A compensating entry makes the ledger
    // agree with the materialized stock used by existing catalogues and carts.
    await queryRunner.query(`
      INSERT INTO kardex (producto_id,tipo_movimiento,cantidad,costo_unitario,valor_total,referencia_id,tipo_referencia)
      SELECT p.producto_id, CASE WHEN p.cantidad > COALESCE(k.balance,0) THEN 'ENTRADA' ELSE 'SALIDA' END::kardex_tipo_movimiento_enum,
        ABS(p.cantidad - COALESCE(k.balance,0)), p.precio, ABS(p.cantidad - COALESCE(k.balance,0)) * p.precio,
        p.producto_id, 'AJUSTE'
      FROM producto p LEFT JOIN (
        SELECT producto_id, SUM(CASE WHEN tipo_movimiento = 'ENTRADA' THEN cantidad WHEN tipo_movimiento = 'SALIDA' THEN -cantidad ELSE 0 END) balance
        FROM kardex GROUP BY producto_id
      ) k ON k.producto_id=p.producto_id
      WHERE p.cantidad <> COALESCE(k.balance,0)`);
    for (const role of ['ADMIN', 'EMPLOYEE', 'CUSTOMER']) {
      await queryRunner.query(`INSERT INTO rol (nombre) SELECT $1 WHERE NOT EXISTS (SELECT 1 FROM rol WHERE nombre=$1)`, [role]);
    }
  }

  down(): Promise<void> {
    throw new Error('Migración con conciliación histórica: restaura el respaldo para revertir sin perder trazabilidad.');
  }
}
