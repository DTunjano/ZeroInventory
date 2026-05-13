import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import type { InventoryProduct } from '../domain/inventory.models'
import { InventoryStatusBadge } from './inventory-status-badge'

interface InventoryTableProps {
  products: InventoryProduct[]
  isLoading?: boolean
  isEmpty?: boolean
}

export function InventoryTable({
  products,
  isLoading = false,
  isEmpty = false,
}: InventoryTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-8 text-center text-zinc-400">
        Cargando inventario...
      </div>
    )
  }

  if (isEmpty || products.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-8 text-center text-zinc-400">
        No hay productos en el inventario.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10">
            <TableHead className="text-white/70">Producto</TableHead>
            <TableHead className="text-white/70">SKU</TableHead>
            <TableHead className="text-white/70">Categoría</TableHead>
            <TableHead className="text-right text-white/70">Stock</TableHead>
            <TableHead className="text-white/70">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.productoId}
              className="border-white/10 hover:bg-white/5"
            >
              <TableCell className="font-medium text-white">
                {product.nombre}
              </TableCell>
              <TableCell className="text-zinc-300">{product.sku}</TableCell>
              <TableCell className="text-zinc-400">{product.categoria}</TableCell>
              <TableCell className="text-right font-semibold text-white">
                {product.stock}
              </TableCell>
              <TableCell>
                <InventoryStatusBadge status={product.estado} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
