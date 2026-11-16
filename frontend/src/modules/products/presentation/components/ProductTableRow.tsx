import { formatCOP } from '@/shared/lib/currency'
import { TableRow, TableCell } from '@/shared/ui/table'
import { cn } from '@/shared/lib/utils'
import type { Product } from '../../domain/product.models'
import { ProductBadge } from './ProductBadge'
import { ProductActionsDropdown } from './ProductActionsDropdown'

export interface ProductTableRowProps {
  product: Product
  imageUrl?: string
  categoryNames?: string[]
  providerName?: string
  onEdit: () => void
  onToggleActive: () => void
  onSoftDelete: () => void
  isLoading?: boolean
}

/**
 * ProductTableRow - Fila de tabla para visualización lista
 * 
 * Domain: Presentation Component
 * Responsabilidad: Renderizar un producto como fila en tabla moderna
 */
export function ProductTableRow({
  product,
  imageUrl,
  categoryNames,
  providerName: _providerName,
  onEdit,
  onToggleActive,
  onSoftDelete,
  isLoading = false,
}: ProductTableRowProps) {
  return (
    <TableRow
      className={cn(
        'border-border hover:bg-muted/50 transition-colors duration-150',
        product.isActive ? '' : 'opacity-70',
      )}
    >
      {/* Imagen */}
      <TableCell className="w-12">
        <div className="w-10 h-10 rounded-md overflow-hidden bg-card flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
          )}
        </div>
      </TableCell>

      {/* Nombre */}
      <TableCell className="font-medium text-foreground">
        <div>
          <p className="text-sm">{product.nombre}</p>
          <p className="text-xs text-muted-foreground mt-1">SKU: {product.sku || '—'}</p>
        </div>
      </TableCell>

      {/* Categoría(s) */}
      <TableCell className="text-sm text-muted-foreground">
        {categoryNames && categoryNames.length ? categoryNames.join(', ') : '—'}
      </TableCell>

      {/* Precio */}
      <TableCell className="text-sm text-foreground font-semibold">
        {formatCOP(product.precio)}
      </TableCell>

      {/* Stock */}
      <TableCell className="text-sm">
        <ProductBadge
          type="stock"
          value={typeof product.cantidad === 'number' ? product.cantidad : 0}
          label={`${typeof product.cantidad === 'number' ? product.cantidad : 0}`}
        />
      </TableCell>

      {/* Estado */}
      <TableCell>
        <ProductBadge type="status" value={product.isActive ? 'active' : 'inactive'} />
      </TableCell>

      {/* Acciones */}
      <TableCell className="text-right">
        <div className="flex justify-end">
          <ProductActionsDropdown
            product={product}
            onEdit={onEdit}
            onToggleActive={onToggleActive}
            onSoftDelete={onSoftDelete}
            isLoading={isLoading}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
