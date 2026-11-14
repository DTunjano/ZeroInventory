import { useState } from 'react'
import { toast } from 'sonner'
import { getProduct } from '@/modules/products/application/products.use-cases'
import { useRegisterStockAdjustmentMutation } from '@/modules/admin-dashboard/application/use-inventory-management'
import type { InventoryProduct } from '../domain/inventory.models'
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

export function StockAdjustmentForm({
  product,
  onClose,
}: {
  product: InventoryProduct
  onClose: () => void
}) {
  const [expected, setExpected] = useState(product.stock)
  const [next, setNext] = useState(String(product.stock))
  const [reason, setReason] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const mutation = useRegisterStockAdjustmentMutation()
  const target = Number(next)
  const valid =
    next !== '' &&
    Number.isInteger(target) &&
    target >= 0 &&
    target <= 2147483647 &&
    target !== expected &&
    !!reason.trim()
  const pending = mutation.isPending || refreshing
  async function refresh() {
    setRefreshing(true)
    try {
      const current = await getProduct(product.productoId)
      setExpected(current.cantidad)
      setNext(String(current.cantidad))
      mutation.reset()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el saldo'))
    } finally {
      setRefreshing(false)
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle>Ajustar stock · {product.nombre}</DialogTitle>
          <DialogDescription>
            Registra un aumento o baja manual con motivo. Se guardarán el saldo
            anterior, el nuevo, el usuario y el movimiento correspondiente.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (!valid) return
            void mutation
              .mutateAsync({
                productoId: product.productoId,
                stockAnterior: expected,
                stockNuevo: target,
                cantidad: Math.abs(target - expected),
                motivo: reason.trim(),
              })
              .then(() => {
                toast.success('Ajuste de inventario registrado')
                onClose()
              })
              .catch(() => {
                /* Render the error while preserving the proposed values. */
              })
          }}
        >
          <p className="text-sm">
            Stock al abrir o actualizar: <strong>{expected}</strong>
          </p>
          <div className="space-y-2">
            <Label htmlFor="stock-adjustment-target">Nuevo stock</Label>
            <Input
              id="stock-adjustment-target"
              type="number"
              required
              min="0"
              max="2147483647"
              step="1"
              value={next}
              onChange={(event) => setNext(event.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock-adjustment-reason">Motivo del ajuste</Label>
            <Input
              id="stock-adjustment-reason"
              required
              maxLength={1000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={pending}
            />
          </div>
          {valid && (
            <p className="text-sm">
              {target > expected ? 'Entrada' : 'Salida'} de{' '}
              {Math.abs(target - expected)} unidades.
            </p>
          )}
          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {getApiErrorMessage(
                mutation.error,
                'No se pudo registrar el ajuste',
              )}
              . Actualiza el saldo y revisa la cantidad antes de reintentar.
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => void refresh()}
          >
            Actualizar saldo y reiniciar cantidad
          </Button>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={onClose}
            >
              Volver
            </Button>
            <Button type="submit" disabled={!valid || pending}>
              {mutation.isPending ? 'Registrando…' : 'Registrar ajuste'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
