import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { Input } from '@/shared/ui/input'

interface Category {
  categoriaId: number
  nombre: string
}

interface CategoryFilterDropdownProps {
  categories: Category[]
  selectedIds: number[]
  onSelectionChange: (ids: number[]) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  label?: string
  placeholder?: string
  searchPlaceholder?: string
}

export function CategoryFilterDropdown({
  categories,
  selectedIds,
  onSelectionChange,
  isOpen,
  onOpenChange,
  label: _label = 'Todas las categorías',
  placeholder = 'Todas las categorías',
  searchPlaceholder = 'Buscar categoría…',
}: CategoryFilterDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    function onPointerDown(event: PointerEvent) {
      const container = ref.current
      if (event.target instanceof Node && container && !container.contains(event.target)) {
        onOpenChange(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [isOpen, onOpenChange])

  const filteredCategories = categories.filter((c) =>
    c.nombre.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleCategory = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((x) => x !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        className="h-10 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/8"
        style={{ width: 'auto', minWidth: '224px' }}
      >
        <span className={selectedIds.length ? 'text-white' : 'text-white/50'}>
          {selectedIds.length ? `${selectedIds.length} seleccionada(s)` : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 rounded-lg border border-white/10 bg-gray-950/95 p-2 shadow-xl shadow-black/50 backdrop-blur-xl" style={{ width: '224px' }}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/30"
            />
          </div>
          <div className="mt-2 max-h-56 overflow-auto space-y-0.5">
            {filteredCategories.map((c) => {
              const selected = selectedIds.includes(c.categoriaId)
              return (
                <button
                  key={c.categoriaId}
                  type="button"
                  className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium transition-colors ${selected ? 'bg-blue-500/20 text-blue-100' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                  onClick={() => toggleCategory(c.categoriaId)}
                >
                  <span>{c.nombre}</span>
                  {selected ? <Check className="h-4 w-4 text-blue-300" /> : <span className="h-4 w-4" />}
                </button>
              )
            })}
            {filteredCategories.length === 0 && (
              <div className="px-2 py-4 text-center text-xs text-white/40">Sin resultados</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
