import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supplierService } from '@/modules/suppliers/application/supplier.service'
import { listProducts } from '@/modules/products/application/products.use-cases'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { Button } from '@/shared/ui/button'
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
import { formatCOP } from '@/shared/lib/currency'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import type { CompraDetalle, CompraDraftInput } from '../domain/purchase.models'

type Line = {
  productoId: number
  nombre: string
  cantidad: string
  costo: string
}
export function PurchaseForm({
  editing,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  editing: CompraDetalle | null
  pending: boolean
  error: unknown
  onClose: () => void
  onSubmit: (input: CompraDraftInput) => Promise<void>
}) {
  const [supplierId, setSupplierId] = useState(editing?.proveedorId ?? 0)
  const [supplierName, setSupplierName] = useState(
    editing?.proveedorNombre ?? '',
  )
  const [supplierSearch, setSupplierSearch] = useState('')
  const [supplierPage, setSupplierPage] = useState(1)
  const [search, setSearch] = useState('')
  const [productPage, setProductPage] = useState(1)
  const [notes, setNotes] = useState(editing?.observaciones ?? '')
  const [lines, setLines] = useState<Line[]>(
    () =>
      editing?.lineas.map((line) => ({
        productoId: line.productoId,
        nombre: line.productoNombre,
        cantidad: String(line.cantidad),
        costo: String(line.costoUnitario),
      })) ?? [],
  )
  const supplierTerm = useDebounce(supplierSearch, 250)
  const term = useDebounce(search, 250)
  const suppliers = useQuery({
    queryKey: ['purchase-suppliers', supplierTerm, supplierPage],
    queryFn: () =>
      supplierService.getAll({
        isActive: true,
        limit: 20,
        page: supplierPage,
        ...(supplierTerm ? { nombre: supplierTerm } : {}),
      }),
  })
  const products = useQuery({
    queryKey: ['purchase-products', supplierId, term, productPage],
    enabled: supplierId > 0,
    queryFn: () =>
      listProducts({
        proveedorId: supplierId,
        isActive: true,
        page: productPage,
        limit: 20,
        ...(term ? { search: term } : {}),
      }),
  })
  const total =
    lines.reduce(
      (sum, line) =>
        sum + Math.round(Number(line.costo) * 100) * Number(line.cantidad),
      0,
    ) / 100
  function patch(id: number, values: Partial<Line>) {
    setLines((current) =>
      current.map((line) =>
        line.productoId === id ? { ...line, ...values } : line,
      ),
    )
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing
              ? `Editar borrador #${editing.compraId}`
              : 'Nueva compra en borrador'}
          </DialogTitle>
          <DialogDescription>
            Define proveedor, productos y costos de compra. El stock cambia al
            confirmar la recepción completa.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            void onSubmit({
              proveedorId: supplierId,
              ...(notes.trim() ? { observaciones: notes.trim() } : {}),
              lineas: lines.map((line) => ({
                productoId: line.productoId,
                cantidad: Number(line.cantidad),
                costoUnitario: Number(line.costo),
              })),
            })
          }}
        >
          <fieldset disabled={pending} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purchase-supplier-search">Buscar proveedor</Label>
              <Input
                id="purchase-supplier-search"
                value={supplierSearch}
                onChange={(event) => {
                  setSupplierSearch(event.target.value)
                  setSupplierPage(1)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase-supplier">Proveedor</Label>
              <Select
                id="purchase-supplier"
                required
                value={supplierId || ''}
                onChange={(event) => {
                  const id = Number(event.target.value)
                  setSupplierId(id)
                  setSupplierName(
                    suppliers.data?.data.find((s) => s.proveedorId === id)
                      ?.nombre ?? '',
                  )
                  setLines([])
                  setSearch('')
                  setProductPage(1)
                }}
              >
                <option value="">Seleccionar proveedor activo</option>
                {supplierId > 0 &&
                  !suppliers.data?.data.some(
                    (s) => s.proveedorId === supplierId,
                  ) && <option value={supplierId}>{supplierName}</option>}
                {suppliers.data?.data.map((supplier) => (
                  <option
                    key={supplier.proveedorId}
                    value={supplier.proveedorId}
                  >
                    {supplier.nombre}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground">
                Cambiar proveedor vacía las líneas del borrador.
              </p>
            </div>
            {suppliers.isError && (
              <p role="alert" className="text-sm text-destructive">
                No se pudieron cargar los proveedores.{' '}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void suppliers.refetch()}
                >
                  Reintentar
                </Button>
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={supplierPage === 1 || suppliers.isFetching}
                onClick={() => setSupplierPage((p) => p - 1)}
              >
                Proveedores anteriores
              </Button>
              <span>Página {supplierPage}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  supplierPage >= (suppliers.data?.totalPages ?? 1) ||
                  suppliers.isFetching
                }
                onClick={() => setSupplierPage((p) => p + 1)}
              >
                Más proveedores
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase-product-search">
                Buscar producto del proveedor
              </Label>
              <Input
                id="purchase-product-search"
                disabled={!supplierId}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setProductPage(1)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase-add-product">Agregar producto</Label>
              <Select
                id="purchase-add-product"
                value=""
                disabled={
                  !supplierId || products.isFetching || lines.length >= 100
                }
                onChange={(event) => {
                  const product = products.data?.data.find(
                    (p) => p.productoId === Number(event.target.value),
                  )
                  if (
                    product &&
                    !lines.some(
                      (line) => line.productoId === product.productoId,
                    )
                  )
                    setLines([
                      ...lines,
                      {
                        productoId: product.productoId,
                        nombre: product.nombre,
                        cantidad: '1',
                        costo: '',
                      },
                    ])
                }}
              >
                <option value="">
                  {products.isFetching
                    ? 'Cargando productos…'
                    : 'Seleccionar producto activo'}
                </option>
                {products.data?.data.map((product) => (
                  <option
                    key={product.productoId}
                    value={product.productoId}
                    disabled={lines.some(
                      (line) => line.productoId === product.productoId,
                    )}
                  >
                    {product.nombre} · {product.sku}
                  </option>
                ))}
              </Select>
            </div>
            {products.isError && (
              <p role="alert" className="text-sm text-destructive">
                No se pudieron cargar los productos.{' '}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void products.refetch()}
                >
                  Reintentar
                </Button>
              </p>
            )}
            {supplierId > 0 && products.data?.total === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay productos activos que coincidan con este proveedor y
                búsqueda.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={productPage === 1 || products.isFetching}
                onClick={() => setProductPage((p) => p - 1)}
              >
                Productos anteriores
              </Button>
              <span>Página {productPage}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  !supplierId ||
                  productPage >= (products.data?.totalPages ?? 1) ||
                  products.isFetching
                }
                onClick={() => setProductPage((p) => p + 1)}
              >
                Más productos
              </Button>
            </div>
            <div className="space-y-3">
              {lines.map((line) => (
                <div
                  key={line.productoId}
                  className="grid gap-3 rounded-xl border bg-muted/30 p-3 sm:grid-cols-[1fr_6rem_8rem_auto]"
                >
                  <p className="self-center text-sm font-medium">
                    {line.nombre}
                  </p>
                  <div>
                    <Label htmlFor={`purchase-qty-${line.productoId}`}>
                      Cantidad · {line.nombre}
                    </Label>
                    <Input
                      id={`purchase-qty-${line.productoId}`}
                      type="number"
                      min="1"
                      max="2147483647"
                      step="1"
                      required
                      value={line.cantidad}
                      onChange={(event) =>
                        patch(line.productoId, { cantidad: event.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`purchase-cost-${line.productoId}`}>
                      Costo COP · {line.nombre}
                    </Label>
                    <Input
                      id={`purchase-cost-${line.productoId}`}
                      type="number"
                      min="0.01"
                      max="999999999999.99"
                      step="0.01"
                      required
                      value={line.costo}
                      onChange={(event) =>
                        patch(line.productoId, { costo: event.target.value })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={`Quitar ${line.nombre}`}
                    onClick={() =>
                      setLines(
                        lines.filter(
                          (row) => row.productoId !== line.productoId,
                        ),
                      )
                    }
                  >
                    Quitar
                  </Button>
                </div>
              ))}
            </div>
            {!lines.length && (
              <p className="text-sm text-muted-foreground">
                Agrega al menos un producto. Máximo 100 productos diferentes.
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="purchase-notes">Observaciones</Label>
              <Input
                id="purchase-notes"
                maxLength={1000}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </fieldset>
          <p className="text-lg font-semibold">
            Total estimado:{' '}
            {Number.isFinite(total) ? formatCOP(total) : 'Revisa los importes'}
          </p>
          <p className="text-xs text-muted-foreground">
            El servidor valida y calcula el total definitivo al guardar.
          </p>
          {!!error && (
            <p role="alert" className="text-sm text-destructive">
              {getApiErrorMessage(error, 'No se pudo guardar la compra')}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={onClose}
            >
              Volver
            </Button>
            <Button
              type="submit"
              disabled={pending || !supplierId || !lines.length}
            >
              {pending ? 'Guardando…' : 'Guardar borrador'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
