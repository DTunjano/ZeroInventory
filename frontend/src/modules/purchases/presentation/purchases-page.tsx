import { useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router-dom'
import { invalidateInventory } from '@/modules/inventory/application/invalidate-inventory'
import { purchases } from '../application/purchases.use-cases'
import type {
  CompraDetalle,
  CompraDraftInput,
  CompraEstado,
} from '../domain/purchase.models'
import { PurchaseForm } from './purchase-form'
import { useAuthStore } from '@/modules/auth/application/auth.store'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { ConfirmModal } from '@/shared/ui/modals/confirm-modal'
import { formatCOP } from '@/shared/lib/currency'
import { getApiErrorMessage } from '@/shared/lib/api-error'

const stateNames: Record<CompraEstado, string> = {
  BORRADOR: 'Borrador',
  RECIBIDA: 'Recibida',
  CANCELADA: 'Cancelada',
  LEGACY: 'Histórica',
}
const actionNames = {
  CREADA: 'Borrador creado',
  ACTUALIZADA: 'Borrador actualizado',
  RECIBIDA: 'Recepción completa',
  CANCELADA: 'Borrador cancelado',
}
const date = (value: string) =>
  new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
type Action =
  | { kind: 'create'; input: CompraDraftInput }
  | { kind: 'update'; record: CompraDetalle; input: CompraDraftInput }
  | { kind: 'receive'; record: CompraDetalle }
  | { kind: 'cancel'; record: CompraDetalle; motivo: string }

function DataTable({
  title,
  headers,
  rows,
}: {
  title: string
  headers: string[]
  rows: ReactNode[][]
}) {
  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{title}</caption>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="border-b p-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, i) => (
                <td key={i} className="border-b p-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PurchasesPage() {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.roles.includes('ADMIN') ?? false
  const queryClient = useQueryClient()
  const [state, setState] = useState<CompraEstado | ''>('')
  const [page, setPage] = useState(1)
  const [params, setParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const id = Number(params.get('purchase'))
    return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null
  })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CompraDetalle | null>(null)
  const [confirmReceipt, setConfirmReceipt] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [reason, setReason] = useState('')
  const list = useQuery({
    queryKey: ['purchases', user?.usuarioId, page, state],
    queryFn: () =>
      purchases.list({ page, limit: 10, ...(state ? { estado: state } : {}) }),
  })
  const detail = useQuery({
    queryKey: ['purchase-detail', user?.usuarioId, selectedId],
    enabled: selectedId !== null,
    queryFn: () => purchases.get(selectedId ?? 0),
  })
  const record = detail.data
  function selectPurchase(id: number) {
    setSelectedId(id)
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.set('purchase', String(id))
        return next
      },
      { replace: true },
    )
  }
  const mutation = useMutation({
    mutationFn: (action: Action) => {
      if (action.kind === 'create') return purchases.create(action.input)
      if (action.kind === 'update')
        return purchases.update(
          action.record.compraId,
          action.record.version,
          action.input,
        )
      if (action.kind === 'receive')
        return purchases.receive(action.record.compraId, action.record.version)
      return purchases.cancel(
        action.record.compraId,
        action.record.version,
        action.motivo,
      )
    },
    onSuccess: async (data, action) => {
      queryClient.setQueryData(
        ['purchase-detail', user?.usuarioId, data.compraId],
        data,
      )
      selectPurchase(data.compraId)
      setFormOpen(false)
      setConfirmReceipt(false)
      setCancelOpen(false)
      setReason('')
      toast.success(
        action.kind === 'receive'
          ? 'Recepción completa confirmada'
          : action.kind === 'cancel'
            ? 'Borrador cancelado'
            : 'Borrador guardado',
      )
      await queryClient.invalidateQueries({
        predicate: (query) =>
          ['purchases', 'purchase-detail'].includes(String(query.queryKey[0])),
      })
      await invalidateInventory(queryClient)
    },
    onError: () => {
      setConfirmReceipt(false)
      void queryClient.invalidateQueries({
        queryKey: ['purchase-detail', user?.usuarioId],
      })
    },
  })
  async function save(input: CompraDraftInput) {
    try {
      await mutation.mutateAsync(
        editing
          ? { kind: 'update', record: editing, input }
          : { kind: 'create', input },
      )
    } catch {
      /* The error stays visible in the form; unsaved fields are preserved. */
    }
  }
  return (
    <div className="mx-auto min-w-0 max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Compras y recepción</h1>
          <p className="text-sm text-muted-foreground">
            Prepara el borrador y confirma la llegada completa de los productos
            al inventario.
          </p>
        </div>
        <Button
          onClick={() => {
            mutation.reset()
            setEditing(null)
            setFormOpen(true)
          }}
        >
          Nueva compra
        </Button>
      </header>
      <section
        aria-label="Lista de compras"
        className="min-w-0 space-y-4 rounded-xl border bg-card p-4"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="purchase-state-filter">Estado de compra</Label>
            <Select
              id="purchase-state-filter"
              value={state}
              onChange={(event) => {
                setState(event.target.value as CompraEstado | '')
                setPage(1)
              }}
            >
              <option value="">Todos los estados</option>
              {Object.entries(stateNames).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <Button
            variant="outline"
            disabled={list.isFetching}
            onClick={() => {
              void list.refetch()
              if (selectedId !== null) void detail.refetch()
            }}
          >
            Actualizar compras
          </Button>
        </div>
        {list.isPending && <p role="status">Cargando compras…</p>}
        {list.isError && (
          <p role="alert" className="text-destructive">
            {getApiErrorMessage(
              list.error,
              'No se pudieron cargar las compras',
            )}
          </p>
        )}
        {list.data && (
          <>
            <p className="text-sm text-muted-foreground">
              {list.data.total} compras encontradas
            </p>
            {!list.data.data.length ? (
              <p>No hay compras para estos filtros.</p>
            ) : (
              <DataTable
                title="Compras"
                headers={[
                  'Compra',
                  'Proveedor',
                  'Estado',
                  'Total COP',
                  'Fecha',
                  'Detalle',
                ]}
                rows={list.data.data.map((purchase) => [
                  <span className="whitespace-nowrap">
                    #{purchase.compraId}
                  </span>,
                  purchase.proveedorNombre,
                  <Badge variant="outline">
                    {stateNames[purchase.estado]}
                  </Badge>,
                  <span className="whitespace-nowrap">
                    {formatCOP(purchase.total)}
                  </span>,
                  <span className="whitespace-nowrap">
                    {date(purchase.fechaCompra)}
                  </span>,
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Ver compra ${purchase.compraId}`}
                    onClick={() => {
                      mutation.reset()
                      selectPurchase(purchase.compraId)
                    }}
                  >
                    Ver detalle
                  </Button>,
                ])}
              />
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="outline"
                disabled={page === 1 || list.isFetching}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {page} de {Math.max(1, list.data.totalPages)}
              </span>
              <Button
                variant="outline"
                disabled={page >= list.data.totalPages || list.isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          </>
        )}
      </section>
      {selectedId !== null && (
        <section
          aria-label="Detalle de compra"
          className="min-w-0 space-y-4 rounded-xl border bg-card p-4"
        >
          {detail.isPending && <p role="status">Cargando detalle…</p>}
          {detail.isError && (
            <p role="alert" className="text-destructive">
              {getApiErrorMessage(
                detail.error,
                'No se pudo consultar el detalle',
              )}
            </p>
          )}
          {record && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">
                  Compra #{record.compraId}
                </h2>
                <Badge variant="outline">{stateNames[record.estado]}</Badge>
              </div>
              <p>
                {record.proveedorNombre} · Total {formatCOP(record.total)}
              </p>
              <p className="text-sm text-muted-foreground">
                Creada por usuario #{record.usuarioId} ·{' '}
                {date(record.fechaCompra)}
              </p>
              {record.observaciones && (
                <p className="whitespace-pre-wrap text-sm">
                  {record.observaciones}
                </p>
              )}
              {record.estado === 'LEGACY' && (
                <p className="rounded-lg bg-muted p-3 text-sm">
                  Registro histórico de solo lectura. No se reconstruye ni se
                  repite su recepción.
                </p>
              )}
              {record.recibidaEn && (
                <p className="text-sm">
                  Recibida por usuario #{record.recibidaPor} ·{' '}
                  {date(record.recibidaEn)}
                </p>
              )}
              {record.canceladaEn && (
                <p className="text-sm">
                  Cancelada por usuario #{record.canceladaPor} ·{' '}
                  {date(record.canceladaEn)} · {record.motivoCancelacion}
                </p>
              )}
              <DataTable
                title={`Productos de compra ${record.compraId}`}
                headers={[
                  'Producto',
                  'SKU',
                  'Cantidad',
                  'Costo COP',
                  'Subtotal COP',
                ]}
                rows={record.lineas.map((line) => [
                  line.productoNombre,
                  line.sku,
                  line.cantidad,
                  formatCOP(line.costoUnitario),
                  formatCOP(line.subtotal),
                ])}
              />
              {record.estado === 'BORRADOR' && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    disabled={mutation.isPending || detail.isFetching}
                    onClick={() => {
                      mutation.reset()
                      setEditing(record)
                      setFormOpen(true)
                    }}
                  >
                    Editar borrador
                  </Button>
                  <Button
                    disabled={mutation.isPending || detail.isFetching}
                    onClick={() => {
                      mutation.reset()
                      setConfirmReceipt(true)
                    }}
                  >
                    Confirmar recepción
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="destructive"
                      disabled={mutation.isPending || detail.isFetching}
                      onClick={() => {
                        mutation.reset()
                        setReason('')
                        setCancelOpen(true)
                      }}
                    >
                      Cancelar borrador
                    </Button>
                  )}
                </div>
              )}
              <h3 className="font-semibold">Historial de la compra</h3>
              {!record.historial.length && (
                <p className="text-sm text-muted-foreground">
                  No existen eventos registrados para esta compra histórica.
                </p>
              )}
              <ol className="space-y-3">
                {record.historial.map((event) => (
                  <li
                    key={event.eventoId}
                    className="rounded-lg border bg-muted/30 p-3"
                  >
                    <p className="font-medium">{actionNames[event.accion]}</p>
                    <p className="text-sm text-muted-foreground">
                      Usuario #{event.usuarioId} · {date(event.fecha)} · Versión{' '}
                      {event.version}
                    </p>
                    {event.motivo && <p className="text-sm">{event.motivo}</p>}
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">
                        Ver productos registrados en este evento
                      </summary>
                      <p className="my-2 text-sm">
                        {event.snapshot.proveedorNombre} ·{' '}
                        {formatCOP(event.snapshot.total)}
                      </p>
                      <DataTable
                        title={`Productos de versión ${event.version}`}
                        headers={[
                          'Producto registrado',
                          'Cantidad',
                          'Costo COP',
                          'Subtotal COP',
                        ]}
                        rows={event.snapshot.lineas.map((line) => [
                          line.productoNombre,
                          line.cantidad,
                          formatCOP(line.costoUnitario),
                          formatCOP(line.subtotal),
                        ])}
                      />
                    </details>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      )}
      {mutation.isError && !formOpen && (
        <p
          role="alert"
          className="rounded-xl border border-destructive p-4 text-destructive"
        >
          {getApiErrorMessage(
            mutation.error,
            'No se pudo completar la operación. Actualiza el detalle e intenta nuevamente.',
          )}
        </p>
      )}
      {formOpen && (
        <PurchaseForm
          key={editing ? `${editing.compraId}-${editing.version}` : 'new'}
          editing={editing}
          pending={mutation.isPending}
          error={mutation.error}
          onClose={() => setFormOpen(false)}
          onSubmit={save}
        />
      )}
      <ConfirmModal
        open={confirmReceipt}
        onOpenChange={(open) => {
          if (!mutation.isPending) setConfirmReceipt(open)
        }}
        title="Confirmar recepción completa"
        description={`Se sumarán al inventario todas las unidades de la compra #${record?.compraId ?? ''}. Sus líneas y costos quedarán conservados en el historial.`}
        confirmText="Recibir compra completa"
        confirmVariant="default"
        isConfirming={mutation.isPending}
        onConfirm={() => {
          if (record) mutation.mutate({ kind: 'receive', record })
        }}
      />
      <Dialog
        open={cancelOpen}
        onOpenChange={(open) => {
          if (!mutation.isPending) setCancelOpen(open)
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>Cancelar borrador</DialogTitle>
            <DialogDescription>
              La compra conservará sus líneas e historial con el motivo de
              cancelación.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              if (record && reason.trim())
                mutation.mutate({
                  kind: 'cancel',
                  record,
                  motivo: reason.trim(),
                })
            }}
          >
            <Label htmlFor="purchase-cancel-reason">
              Motivo de cancelación
            </Label>
            <Input
              id="purchase-cancel-reason"
              required
              maxLength={1000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={mutation.isPending}
            />
            {mutation.isError && (
              <p role="alert" className="text-sm text-destructive">
                {getApiErrorMessage(
                  mutation.error,
                  'No se pudo cancelar el borrador',
                )}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => setCancelOpen(false)}
              >
                Volver
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!reason.trim() || mutation.isPending}
              >
                Confirmar cancelación
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
