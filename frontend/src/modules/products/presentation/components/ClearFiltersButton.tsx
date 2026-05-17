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
      className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/8 hover:text-white/80 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={!hasActiveFilters}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
