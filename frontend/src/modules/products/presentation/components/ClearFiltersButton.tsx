import { Trash2 } from 'lucide-react'

interface ClearFiltersButtonProps {
  onClick: () => void
  hasActiveFilters?: boolean
}

export function ClearFiltersButton({ onClick, hasActiveFilters = true }: ClearFiltersButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Limpiar filtros"
      aria-label="Limpiar filtros"
      className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={!hasActiveFilters}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
