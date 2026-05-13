import { Grid3X3, List } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export type ViewMode = 'grid' | 'list'

export interface ViewToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
  className?: string
}

/**
 * ViewToggle - Toggle para cambiar entre vista grid y lista
 * 
 * Domain: Presentation Component
 * Responsabilidad: Permitir cambio entre modos de visualización
 */
export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-1.5 rounded-lg',
        'bg-white/5 border border-white/10',
        'backdrop-blur-sm',
        className,
      )}
    >
      <button
        onClick={() => onChange('grid')}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-md',
          'transition-all duration-200',
          value === 'grid'
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            : 'text-white/60 hover:text-white/80 hover:bg-white/5',
        )}
        aria-label="Grid view"
        title="Vista de cuadrícula"
      >
        <Grid3X3 className="w-4 h-4" />
      </button>

      <button
        onClick={() => onChange('list')}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-md',
          'transition-all duration-200',
          value === 'list'
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            : 'text-white/60 hover:text-white/80 hover:bg-white/5',
        )}
        aria-label="List view"
        title="Vista de lista"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  )
}
