import { Input } from '@/shared/ui/input'
import type { InventoryStatusType } from '../domain/inventory.models'

interface InventoryFilterBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  statusFilter: 'ALL' | InventoryStatusType
  onStatusChange: (status: 'ALL' | InventoryStatusType) => void
  isActiveFilter: 'ALL' | boolean
  onIsActiveChange: (filter: 'ALL' | boolean) => void
}

const statusOptions = [
  { label: 'Todos', value: 'ALL' as const },
  { label: 'Saludable', value: 'HEALTHY' as const },
  { label: 'Bajo', value: 'LOW_STOCK' as const },
  { label: 'Crítico', value: 'CRITICAL' as const },
  { label: 'Agotado', value: 'OUT_OF_STOCK' as const },
]

const activeOptions = [
  { label: 'Todos', value: 'ALL' as const },
  { label: 'Activos', value: true as const },
  { label: 'Inactivos', value: false as const },
]

export function InventoryFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  isActiveFilter,
  onIsActiveChange,
}: InventoryFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-full max-w-sm">
        <Input
          placeholder="Buscar por nombre o código SKU…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 rounded-lg border-white/10 bg-zinc-950/70 px-3 text-sm text-white placeholder:text-zinc-500"
        />
      </div>

      <div className="inline-flex rounded-lg border border-white/10 bg-zinc-900/70 p-1">
        {statusOptions.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => onStatusChange(value)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              statusFilter === value
                ? 'bg-blue-500 text-white'
                : 'text-zinc-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="inline-flex rounded-lg border border-white/10 bg-zinc-900/70 p-1">
        {activeOptions.map(({ label, value }) => (
          <button
            key={String(value)}
            type="button"
            onClick={() => onIsActiveChange(value)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              isActiveFilter === value
                ? 'bg-blue-500 text-white'
                : 'text-zinc-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
