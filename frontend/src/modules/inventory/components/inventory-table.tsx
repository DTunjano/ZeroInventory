import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { useSettingsStore } from '@/modules/settings/application/settings.store'
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
  const theme = useSettingsStore((state) => state.theme)
  const isDark = theme === 'dark'

  if (isLoading) {
    return (
      <div className={`rounded-2xl border p-8 text-center ${isDark ? 'border-white/10 bg-zinc-900/70 text-zinc-400' : 'border-slate-200 bg-white text-slate-500 shadow-sm'}`}>
        Cargando inventario...
      </div>
    )
  }

  if (isEmpty || products.length === 0) {
    return (
      <div className={`rounded-2xl border p-8 text-center ${isDark ? 'border-white/10 bg-zinc-900/70 text-zinc-400' : 'border-slate-200 bg-white text-slate-500 shadow-sm'}`}>
        No hay productos en el inventario.
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-zinc-900/70' : 'border-slate-200 bg-white shadow-sm'}`}>
      <Table>
        <TableHeader>
          <TableRow className={isDark ? 'border-white/10' : 'border-slate-200'}>
            <TableHead className={isDark ? 'text-white/70' : 'text-slate-500'}>Producto</TableHead>
            <TableHead className={isDark ? 'text-white/70' : 'text-slate-500'}>SKU</TableHead>
            <TableHead className={isDark ? 'text-white/70' : 'text-slate-500'}>Categoría</TableHead>
            <TableHead className={`text-right ${isDark ? 'text-white/70' : 'text-slate-500'}`}>Stock</TableHead>
            <TableHead className={isDark ? 'text-white/70' : 'text-slate-500'}>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.productoId}
              className={isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}
            >
              <TableCell className={isDark ? 'font-medium text-white' : 'font-medium text-slate-900'}>
                {product.nombre}
              </TableCell>
              <TableCell className={isDark ? 'text-zinc-300' : 'text-slate-600'}>{product.sku}</TableCell>
              <TableCell className={isDark ? 'text-zinc-400' : 'text-slate-500'}>{product.categoria}</TableCell>
              <TableCell className={isDark ? 'text-right font-semibold text-white' : 'text-right font-semibold text-slate-900'}>
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
