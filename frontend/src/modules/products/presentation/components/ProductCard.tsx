import { cn } from '@/shared/lib/utils'
import { truncateText } from '../../domain/text.utils'
import type { Product } from '../../domain/product.models'
import { ProductBadge } from './ProductBadge'
import { ProductActionsDropdown } from './ProductActionsDropdown'

export interface ProductCardProps {
  product: Product
  imageUrl?: string
  categoryNames?: string[]
  onEdit: () => void
  onToggleActive: () => void
  onSoftDelete: () => void
  isLoading?: boolean
}

/**
 * ProductCard - Card moderna para visualización en grid (Shopify-style)
 * 
 * Domain: Presentation Component
 * Responsabilidad: Renderizar un producto como una card premium con imagen, nombre, precio, stock y acciones
 */
export function ProductCard({
  product,
  imageUrl,
  categoryNames,
  onEdit,
  onToggleActive,
  onSoftDelete,
  isLoading = false,
}: ProductCardProps) {
  const displayPrice = typeof product.precio === 'number' ? product.precio.toFixed(2) : '0.00'
  const displayQuantity = typeof product.cantidad === 'number' ? product.cantidad : 0
  const productNameDisplay = truncateText(product.nombre, 40)

  return (
    <div
      className={cn(
        'group relative rounded-lg overflow-hidden',
        'bg-white/5',
        'backdrop-blur-sm',
        'transition-all duration-300',
        'hover:border-blue-500/50 hover:bg-white/8 hover:shadow-xl hover:shadow-blue-500/10',
        product.isActive ? '' : 'opacity-60',
      )}
    >
      {/* Imagen - Mayor altura y prioritaria */}
      <div
        className={cn(
          'relative h-64 overflow-hidden bg-gray-950',
          'group-hover:brightness-110 transition-all duration-300',
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.nombre}
            className={cn(
              'w-full h-full object-cover',
              'group-hover:scale-105 transition-transform duration-300',
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900/50">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-white/10 mb-2">
                <span className="text-4xl">📦</span>
              </div>
              <p className="text-xs text-white/40">Sin imagen</p>
            </div>
          </div>
        )}

        {/* Overlay invisible on hover */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Contenido */}
      <div className="p-5 space-y-4">
        {/* Nombre con Dropdown */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                'text-base font-semibold text-white',
                'group-hover:text-blue-300 transition-colors duration-200',
                'break-words',
              )}
              title={product.nombre}
            >
              {productNameDisplay}
            </h3>
          </div>

          {/* Dropdown Menu - Siempre visible */}
          <div className="flex-shrink-0 -mt-1">
            <ProductActionsDropdown
              product={product}
              onEdit={onEdit}
              onToggleActive={onToggleActive}
              onSoftDelete={onSoftDelete}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Categoría(s) */}
        {categoryNames && categoryNames.length > 0 && (
          <p className="text-xs text-white/50 line-clamp-1">{categoryNames.join(', ')}</p>
        )}

        {/* Precio y Stock */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div>
            <p className="text-xs text-white/60 mb-2">Precio</p>
            <p className="text-xl font-bold text-white">${displayPrice}</p>
          </div>

          <div className="text-right">
            <p className="text-xs text-white/60 mb-2">Stock</p>
            <ProductBadge
              type="stock"
              value={displayQuantity}
              label={`${displayQuantity}`}
              className="ml-auto"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
