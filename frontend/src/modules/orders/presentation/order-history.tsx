import type { Order } from '../domain/orders.models'
import { actionLabels } from './order-actions'
import { formatCOP } from '@/shared/lib/currency'
export function OrderHistory({ order }: { order: Order }) {
  return (
    <details className="rounded-lg border p-3">
      <summary className="cursor-pointer font-medium">
        Historial del pedido ({order.historial.length})
      </summary>
      <ol className="mt-3 space-y-3">
        {order.historial.map((event) => (
          <li key={event.eventoId} className="rounded border p-3 text-sm">
            <p className="font-medium">
              Versión {event.version} ·{' '}
              {event.accion === 'CREADO'
                ? 'Pedido creado'
                : actionLabels[event.accion]}
            </p>
            <p>
              {new Intl.DateTimeFormat('es-CO', {
                dateStyle: 'short',
                timeStyle: 'short',
                timeZone: 'America/Bogota',
              }).format(new Date(event.fecha))}{' '}
              · Usuario #{event.usuarioId}
            </p>
            <p>{event.motivo}</p>
            <p>
              Total conservado: {formatCOP(event.snapshot.total)} ·{' '}
              {event.snapshot.detalles.reduce((n, l) => n + l.cantidad, 0)}{' '}
              unidades.
            </p>
          </li>
        ))}
      </ol>
      {!order.historial.length && (
        <p className="mt-3 text-sm text-muted-foreground">
          No se reconstruye historial de documentos antiguos.
        </p>
      )}
    </details>
  )
}
