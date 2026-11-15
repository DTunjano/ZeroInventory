import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReportRepository } from '../domain/report.repository';
import { ReportRange, ReportsSnapshot } from '../domain/report.types';
import { reportAmount as money } from '../application/report-amount';

type Numeric = string | number;
type SummaryRow = { orders: Numeric; order_total: Numeric; approved: Numeric; pending: Numeric };
type GroupRow = { label: string; count: Numeric; total: Numeric };
type ProductRow = { product_id: number; name: string; units: Numeric; total: Numeric };

@Injectable()
export class TypeOrmReportRepository implements ReportRepository {
  constructor(private readonly db: DataSource) {}
  snapshot(period: ReportRange): Promise<ReportsSnapshot> {
    return this.db.transaction('REPEATABLE READ', async (manager) => {
      await manager.query('SET TRANSACTION READ ONLY');
      const params = [period.dateFrom, period.dateTo];
      const orderDate="COALESCE(registrada_en AT TIME ZONE 'America/Bogota',fecha)";
      const paymentDate="COALESCE(COALESCE(decidido_en,registrado_en) AT TIME ZONE 'America/Bogota',fecha_pago)";
      const [summaryRows, daily, states, methods, products, inventoryRows, lowStock] = [
        await manager.query<SummaryRow[]>(`SELECT
          (SELECT COUNT(*) FROM pedido WHERE ${orderDate} >= $1::date AND ${orderDate} < $2::date + INTERVAL '1 day') AS orders,
          (SELECT COALESCE(SUM(total),0) FROM pedido WHERE ${orderDate} >= $1::date AND ${orderDate} < $2::date + INTERVAL '1 day') AS order_total,
          (SELECT COALESCE(SUM(monto),0) FROM pago WHERE estado='APROBADO' AND ${paymentDate} >= $1::date AND ${paymentDate} < $2::date + INTERVAL '1 day') AS approved,
          (SELECT COALESCE(SUM(monto),0) FROM pago WHERE estado='PENDIENTE' AND ${paymentDate} >= $1::date AND ${paymentDate} < $2::date + INTERVAL '1 day') AS pending`, params),
        await manager.query<GroupRow[]>(`SELECT TO_CHAR(${orderDate},'YYYY-MM-DD') AS label, COUNT(*) AS count, SUM(total) AS total
          FROM pedido WHERE ${orderDate} >= $1::date AND ${orderDate} < $2::date + INTERVAL '1 day' GROUP BY 1 ORDER BY 1`, params),
        await manager.query<GroupRow[]>(`SELECT estado::text AS label, COUNT(*) AS count, SUM(total) AS total
          FROM pedido WHERE ${orderDate} >= $1::date AND ${orderDate} < $2::date + INTERVAL '1 day' GROUP BY 1 ORDER BY 1`, params),
        await manager.query<GroupRow[]>(`SELECT metodo_pago::text AS label, COUNT(*) AS count, SUM(monto) AS total
          FROM pago WHERE estado='APROBADO' AND ${paymentDate} >= $1::date AND ${paymentDate} < $2::date + INTERVAL '1 day' GROUP BY 1 ORDER BY 1`, params),
        await manager.query<ProductRow[]>(`SELECT d.producto_id AS product_id, p.nombre AS name, SUM(d.cantidad) AS units, SUM(d.subtotal) AS total
          FROM pedido_detalle d JOIN pedido o ON o.pedido_id=d.pedido_id JOIN producto p ON p.producto_id=d.producto_id
          WHERE COALESCE(o.registrada_en AT TIME ZONE 'America/Bogota',o.fecha) >= $1::date AND COALESCE(o.registrada_en AT TIME ZONE 'America/Bogota',o.fecha) < $2::date + INTERVAL '1 day' AND o.estado IN ('CONFIRMADO','COMPLETADO','ENVIADO')
          GROUP BY d.producto_id,p.nombre ORDER BY SUM(d.cantidad) DESC,d.producto_id LIMIT 10`, params),
        await manager.query<{ products: Numeric; units: Numeric }[]>(`SELECT COUNT(*) AS products, COALESCE(SUM(cantidad),0) AS units FROM producto WHERE is_active=true`),
        await manager.query<{ productId: number; sku: string; name: string; quantity: number }[]>(`SELECT producto_id AS "productId",sku,nombre AS name,cantidad AS quantity
          FROM producto WHERE is_active=true AND cantidad<=5 ORDER BY cantidad,producto_id LIMIT 10`),
      ];
      const summary = summaryRows[0]; const inventory = inventoryRows[0];
      const [refunds]=await manager.query<{pending:Numeric;registered:Numeric}[]>(`SELECT
        COALESCE(SUM(monto) FILTER(WHERE estado='PENDIENTE' AND creada_en AT TIME ZONE 'America/Bogota'>=$1::date AND creada_en AT TIME ZONE 'America/Bogota'<$2::date+INTERVAL '1 day'),0) AS pending,
        COALESCE(SUM(monto) FILTER(WHERE estado='REGISTRADO' AND registrada_en AT TIME ZONE 'America/Bogota'>=$1::date AND registrada_en AT TIME ZONE 'America/Bogota'<$2::date+INTERVAL '1 day'),0) AS registered FROM pedido_reembolso`,params);
      return {
        period, summary: { orders: Number(summary.orders), orderTotal: money(summary.order_total), approvedPayments: money(summary.approved), pendingPayments: money(summary.pending) },
        refunds:{pending:money(refunds.pending),registered:money(refunds.registered)},
        daily: daily.map((row) => ({ date: row.label, orders: Number(row.count), total: money(row.total) })),
        states: states.map((row) => ({ state: row.label, orders: Number(row.count), total: money(row.total) })),
        methods: methods.map((row) => ({ method: row.label, payments: Number(row.count), amount: money(row.total) })),
        topProducts: products.map((row) => ({ productId: row.product_id, name: row.name, units: Number(row.units), total: money(row.total) })),
        inventory: { activeProducts: Number(inventory.products), units: Number(inventory.units), lowStockThreshold: 5, lowStock },
      };
    });
  }
}
