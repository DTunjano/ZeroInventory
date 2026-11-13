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
      <div className={`rounded-2xl border p-8 text-center ${isDark ? 'border-border bg-card text-muted-foreground' : 'border-slate-200 bg-white text-muted-foreground shadow-sm'}`}>
        Cargando inventario...
      </div>
    )
  }

  if (isEmpty || products.length === 0) {
    return (
      <div className={`rounded-2xl border p-8 text-center ${isDark ? 'border-border bg-card text-muted-foreground' : 'border-slate-200 bg-white text-muted-foreground shadow-sm'}`}>
        No hay productos en el inventario.
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-2xl border ${isDark ? 'border-border bg-card' : 'border-slate-200 bg-white shadow-sm'}`}>
      <Table>
        <TableHeader>
          <TableRow className={isDark ? 'border-border' : 'border-slate-200'}>
            <TableHead className={isDark ? 'text-muted-foreground' : 'text-muted-foreground'}>Producto</TableHead>
            <TableHead className={isDark ? 'text-muted-foreground' : 'text-muted-foreground'}>SKU</TableHead>
            <TableHead className={isDark ? 'text-muted-foreground' : 'text-muted-foreground'}>Categoría</TableHead>
            <TableHead className={`text-right ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>Stock</TableHead>
            <TableHead className={isDark ? 'text-muted-foreground' : 'text-muted-foreground'}>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.productoId}
              className={isDark ? 'border-border hover:bg-muted/50' : 'border-slate-200 hover:bg-slate-50'}
            >
              <TableCell className={isDark ? 'font-medium text-foreground' : 'font-medium text-slate-900'}>
                {product.nombre}
              </TableCell>
              <TableCell className={isDark ? 'text-muted-foreground' : 'text-slate-600'}>{product.sku}</TableCell>
              <TableCell className={isDark ? 'text-muted-foreground' : 'text-muted-foreground'}>{product.categoria}</TableCell>
              <TableCell className={isDark ? 'text-right font-semibold text-foreground' : 'text-right font-semibold text-slate-900'}>
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
