import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProductMovements } from '../application/use-product-movements'
import type { InventoryProduct } from '../domain/inventory.models'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { formatCOP } from '@/shared/lib/currency'
import { getApiErrorMessage } from '@/shared/lib/api-error'

const references = {
  RECEPCION_COMPRA: 'Recepción de compra',
  COMPRA: 'Compra / referencia histórica',
  AJUSTE: 'Ajuste / registro inicial',
  VENTA: 'Venta',
}
export function ProductMovements({
  product,
  onClose,
}: {
  product: InventoryProduct
  onClose: () => void
}) {
  const [page, setPage] = useState(1)
  const movements = useProductMovements(product.productoId, page)
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kardex · {product.nombre}</DialogTitle>
          <DialogDescription>
            Entradas, salidas y referencias del producto. El saldo corresponde a
            entradas menos salidas.
          </DialogDescription>
        </DialogHeader>
        {movements.isPending && <p role="status">Cargando movimientos…</p>}
        {movements.isError && (
          <p role="alert" className="text-destructive">
            {getApiErrorMessage(
              movements.error,
              'No se pudieron cargar los movimientos',
            )}
          </p>
        )}
        {movements.data && (
          <>
            <p className="text-sm">
              Stock actual: {movements.data.stockActual} · Saldo de Kardex:{' '}
              {movements.data.saldoKardex}
            </p>
            {!movements.data.data.length ? (
              <p>Sin movimientos registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    Movimientos de {product.nombre}
                  </caption>
                  <thead>
                    <tr>
                      {[
                        'Fecha',
                        'Movimiento',
                        'Cantidad',
                        'Costo COP',
                        'Valor COP',
                        'Referencia',
                      ].map((header) => (
                        <th scope="col" key={header} className="border-b p-2">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {movements.data.data.map((row) => (
                      <tr key={row.kardexId}>
                        <td className="whitespace-nowrap border-b p-2">
                          {new Intl.DateTimeFormat('es-CO', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                            timeZone: 'America/Bogota',
                          }).format(new Date(row.fechaMovimiento))}
                        </td>
                        <td className="border-b p-2">{row.tipoMovimiento}</td>
                        <td className="border-b p-2">{row.cantidad}</td>
                        <td className="border-b p-2">
                          {formatCOP(row.costoUnitario)}
                        </td>
                        <td className="border-b p-2">
                          {formatCOP(row.valorTotal)}
                        </td>
                        <td className="border-b p-2">
                          {row.tipoReferencia === 'RECEPCION_COMPRA' ? (
                            <Link
                              className="text-primary underline"
                              to={`/admin/purchases?purchase=${row.referenciaId}`}
                            >
                              Compra #{row.referenciaId}
                            </Link>
                          ) : (
                            <span>
                              {references[row.tipoReferencia]} #
                              {row.referenciaId}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="outline"
                disabled={page === 1 || movements.isFetching}
                onClick={() => setPage((p) => p - 1)}
              >
                Movimientos anteriores
              </Button>
              <span className="text-sm">
                Página {page} de {Math.max(1, movements.data.totalPages)}
              </span>
              <Button
                variant="outline"
                disabled={
                  page >= movements.data.totalPages || movements.isFetching
                }
                onClick={() => setPage((p) => p + 1)}
              >
                Más movimientos
              </Button>
            </div>
          </>
        )}
        <Button
          variant="outline"
          disabled={movements.isFetching}
          onClick={() => void movements.refetch()}
        >
          Actualizar Kardex
        </Button>
      </DialogContent>
    </Dialog>
  )
}
