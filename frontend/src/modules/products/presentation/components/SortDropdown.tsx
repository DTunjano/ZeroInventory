import { useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type SortOption = 'stock' | 'nombre' | undefined

interface SortDropdownProps {
  value: SortOption
  onChange: (value: SortOption) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const SORT_OPTIONS: Array<{
  value: SortOption
  label: string
}> = [
  { value: undefined, label: 'Orden por defecto' },
  { value: 'stock', label: 'Stock' },
  { value: 'nombre', label: 'Nombre' },
]

export function SortDropdown({
  value,
  onChange,
  isOpen,
  onOpenChange,
}: SortDropdownProps) {
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

  const currentLabel = SORT_OPTIONS.find((opt) => opt.value === value)?.label || 'Orden por defecto'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        className="h-10 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80"
        style={{ width: '160px' }}
      >
        <span>{currentLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-40 rounded-lg border border-white/10 bg-gray-950/95 p-1 shadow-xl shadow-black/50">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value ?? 'default'}
              type="button"
              className={cn(
                'w-full text-left rounded-md px-3 py-2 text-sm transition-colors',
                value === option.value
                  ? 'bg-blue-500/20 text-blue-100'
                  : 'text-white/70 hover:bg-white/5 hover:text-white',
              )}
              onClick={() => {
                onChange(option.value)
                onOpenChange(false)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
