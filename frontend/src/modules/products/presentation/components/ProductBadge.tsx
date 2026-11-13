import { cn } from '@/shared/lib/utils'

export interface ProductBadgeProps {
  type: 'stock' | 'status'
  value: number | 'active' | 'inactive'
  label?: string
  className?: string
}

/**
 * ProductBadge - Badge moderno para mostrar estado de stock o estado del producto
 * 
 * Domain: Presentation Component
 * Responsabilidad: Renderizar badges visuales para stock y estado
 */
export function ProductBadge({ type, value, label, className }: ProductBadgeProps) {
  if (type === 'stock') {
    const stockValue = typeof value === 'number' ? value : 0

    if (stockValue === 0) {
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            'bg-red-900/30 text-red-700 dark:text-red-300 border border-red-800/50',
            'transition-colors duration-200',
            className,
          )}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
          {label || 'Out of stock'}
        </span>
      )
    }

    if (stockValue < 20) {
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            'bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-800/50',
            'transition-colors duration-200',
            className,
          )}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500" />
          {label || `${stockValue} in stock`}
        </span>
      )
    }

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
          'bg-green-900/30 text-green-700 dark:text-green-300 border border-green-800/50',
          'transition-colors duration-200',
          className,
        )}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
        {label || `${stockValue} in stock`}
      </span>
    )
  }

  // Status badge
  const isActive = value === 'active'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        isActive
          ? 'bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-800/50'
          : 'bg-card text-muted-foreground border border-gray-700/50',
        'transition-colors duration-200',
        className,
      )}
    >
      <span
        className={cn(
          'inline-block w-1.5 h-1.5 rounded-full',
          isActive ? 'bg-blue-500' : 'bg-gray-500',
        )}
      />
      {isActive ? 'active' : 'inactive'}
    </span>
  )
}
