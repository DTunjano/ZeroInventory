import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/utils'
import { useSettingsStore } from '@/modules/settings/application/settings.store'
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
  const theme = useSettingsStore((state) => state.theme)
  const isDark = theme === 'dark'

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-full max-w-sm">
        <Input
          placeholder="Buscar por nombre o código SKU…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn('h-10 rounded-lg px-3 text-sm', isDark ? 'border-border bg-card text-foreground placeholder:text-muted-foreground' : 'border-slate-300 bg-white text-slate-900 placeholder:text-muted-foreground')}
        />
      </div>

      <div className={cn('inline-flex rounded-lg border p-1', isDark ? 'border-border bg-card' : 'border-slate-200 bg-slate-100')}>
        {statusOptions.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => onStatusChange(value)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              statusFilter === value
                ? 'bg-blue-600 text-white'
                : isDark
                  ? 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={cn('inline-flex rounded-lg border p-1', isDark ? 'border-border bg-card' : 'border-slate-200 bg-slate-100')}>
        {activeOptions.map(({ label, value }) => (
          <button
            key={String(value)}
            type="button"
            onClick={() => onIsActiveChange(value)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              isActiveFilter === value
                ? 'bg-blue-600 text-white'
                : isDark
                  ? 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
