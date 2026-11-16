import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/modules/auth/application/auth.store'
import { invalidateInventory } from '@/modules/inventory/application/invalidate-inventory'
import { ordersApi } from '../infrastructure/orders.api'
import type { Order, OrderAction, OrderCommand } from '../domain/orders.models'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { formatCOP } from '@/shared/lib/currency'
export const orderStates = {
  CONFIRMADO: 'Confirmado',
  ENVIADO: 'Enviado',
  COMPLETADO: 'Entregado',
  CANCELADO: 'Cancelado',
  DEVUELTO: 'Devuelto',
} as const
export const actionLabels: Record<OrderAction, string> = {
  ENVIAR: 'Registrar envío',
  ENTREGAR: 'Confirmar entrega',
  CANCELAR: 'Cancelar pedido',
  DEVOLVER: 'Recibir devolución completa',
  APROBAR_PAGO: 'Registrar pago aprobado',
  RECHAZAR_PAGO: 'Rechazar pago',
  REINTENTAR_PAGO: 'Crear nuevo intento de pago',
  REGISTRAR_REEMBOLSO: 'Registrar reembolso realizado',
}
export function OrderActions({
  order,
  customer = false,
}: {
  order: Order
  customer?: boolean
}) {
  const user = useAuthStore((s) => s.user),
    admin = user?.roles.includes('ADMIN') ?? false
  const [operation, setOperation] = useState<{
    action: OrderAction
    command: OrderCommand
  } | null>(null)
  const [reason, setReason] = useState(''),
    [acknowledged, setAcknowledged] = useState(false)
  const client = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => {
      if (!operation) throw Error('Selecciona una operación')
      return ordersApi.operate(
        order.pedidoId,
        operation.action,
        { ...operation.command, motivo: reason.trim() },
        customer,
      )
    },
    onSuccess: async (data) => {
      client.setQueryData(
        ['order-detail', user?.usuarioId, order.pedidoId],
        data,
      )
      setOperation(null)
      toast.success('Operación del pedido registrada')
      await client.invalidateQueries({
        predicate: (q) =>
          ['orders', 'admin-orders', 'order-detail'].includes(
            String(q.queryKey[0]),
          ),
      })
      await invalidateInventory(client)
    },
  })
  if (!order.version)
    return (
      <p className="text-sm text-muted-foreground">
        Pedido histórico de solo lectura. Sus datos y existencias no se
        modifican automáticamente.
      </p>
    )
  const allowed: OrderAction[] = []
  if (order.estado === 'CONFIRMADO') {
    if (customer || admin) allowed.push('CANCELAR')
    if (!customer) {
      if (order.pago?.estado === 'APROBADO') allowed.push('ENVIAR')
      if (admin && order.pago?.metodoPago !== 'WOMPI' && order.pago?.estado === 'PENDIENTE')
        allowed.push('APROBAR_PAGO', 'RECHAZAR_PAGO')
      if (admin && order.pago?.metodoPago !== 'WOMPI' && order.pago?.estado === 'RECHAZADO')
        allowed.push('REINTENTAR_PAGO')
    }
  }
  if (!customer && order.estado === 'ENVIADO') allowed.push('ENTREGAR')
  if (!customer && admin && order.estado === 'COMPLETADO')
    allowed.push('DEVOLVER')
  if (!customer && admin && order.reembolso?.estado === 'PENDIENTE')
    allowed.push('REGISTRAR_REEMBOLSO')
  const physical = operation?.action === 'DEVOLVER'
  const financial =
    operation?.action === 'APROBAR_PAGO' ||
    operation?.action === 'REGISTRAR_REEMBOLSO'
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {allowed.map((action) => (
          <Button
            key={action}
            disabled={mutation.isPending}
            variant={action === 'CANCELAR' ? 'outline' : 'default'}
            onClick={() => {
              mutation.reset()
              setReason('')
              setAcknowledged(false)
              setOperation({
                action,
                command: {
                  version: order.version,
                  motivo: '',
                  ...(['APROBAR_PAGO', 'RECHAZAR_PAGO'].includes(action) &&
                  order.pago
                    ? { pagoId: order.pago.pagoId }
                    : {}),
                },
              })
            }}
          >
            {actionLabels[action]}
          </Button>
        ))}
      </div>
      {order.reembolso && (
        <p className="text-sm">
          Reembolso interno: {order.reembolso.estado} ·{' '}
          {formatCOP(order.reembolso.monto)}
          {order.reembolso.motivo ? ` · ${order.reembolso.motivo}` : ''}
        </p>
      )}
      {operation && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open && !mutation.isPending) setOperation(null)
          }}
        >
          <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {actionLabels[operation.action]} · Pedido #
                {order.numeroPedidoUsuario}
              </DialogTitle>
              <DialogDescription>
                {physical
                  ? 'Confirma únicamente después de recibir físicamente todos los productos. Se reintegrarán todas las unidades una sola vez.'
                  : financial
                    ? 'Registra una operación ya realizada o verificada. Esta aplicación no envía dinero ni ejecuta cobros o transferencias.'
                    : operation.action === 'CANCELAR'
                      ? 'Solo antes del envío. Se cancelará el pedido completo y se reintegrarán sus unidades. Un pago aprobado dejará un reembolso interno pendiente.'
                      : operation.action === 'ENTREGAR'
                        ? 'Confirma que el cliente recibió todos los productos del pedido.'
                        : operation.action === 'RECHAZAR_PAGO'
                          ? 'El rechazo se guardará en el historial; no cancela el pedido ni modifica existencias.'
                          : operation.action === 'REINTENTAR_PAGO'
                            ? 'Se conservará el intento rechazado y se creará otro pendiente por el mismo total.'
                            : 'Registra el despacho del pedido cuyo pago ya fue aprobado.'}
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (reason.trim() && (!(physical || financial) || acknowledged))
                  void mutation.mutateAsync().catch(() => {})
              }}
            >
              <p>Total del pedido: {formatCOP(order.total)}</p>
              <Label htmlFor={`order-reason-${order.pedidoId}`}>
                Motivo o referencia de la operación
              </Label>
              <Input
                id={`order-reason-${order.pedidoId}`}
                required
                maxLength={1000}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={mutation.isPending}
              />
              {(physical || financial) && (
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    disabled={mutation.isPending}
                  />
                  {physical
                    ? 'Confirmo recepción física de todos los productos.'
                    : 'Confirmo que la operación fue verificada fuera de la aplicación.'}
                </label>
              )}
              {mutation.isError && (
                <div role="alert" className="text-sm text-destructive">
                  <p>{getApiErrorMessage(
                    mutation.error,
                    'No se pudo registrar la operación',
                  )}</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      void client.invalidateQueries({
                        predicate: (q) =>
                          ['orders', 'admin-orders', 'order-detail'].includes(
                            String(q.queryKey[0]),
                          ),
                      }).then(() => setOperation(null))
                    }}
                  >
                    Actualizar y revisar pedido
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => setOperation(null)}
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  disabled={
                    mutation.isPending ||
                    !reason.trim() ||
                    ((physical || financial) && !acknowledged)
                  }
                >
                  {mutation.isPending ? 'Guardando…' : 'Aplicar operación'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
