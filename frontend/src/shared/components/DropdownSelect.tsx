import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

export type DropdownOption<T extends string | number | undefined> = {
  value: T
  label: string
}

type DropdownSelectProps<T extends string | number | undefined> = {
  value: T
  onChange: (value: T) => void
  options: Array<DropdownOption<T>>
  width?: string
  align?: 'left' | 'right'
  placeholder?: string
}

export function DropdownSelect<T extends string | number | undefined>({
  value,
  onChange,
  options,
  width = '160px',
  align = 'right',
  placeholder,
}: DropdownSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    function onPointerDown(event: PointerEvent) {
      const container = ref.current
      if (event.target instanceof Node && container && !container.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [isOpen])

  const currentLabel = options.find((option) => option.value === value)?.label ?? placeholder ?? options[0]?.label ?? ''

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80"
        style={{ width }}
      >
        <span>{currentLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-[calc(100%+0.5rem)] z-50 rounded-lg border border-white/10 bg-gray-950/95 p-1 shadow-xl shadow-black/50',
            align === 'right' ? 'right-0' : 'left-0',
          )}
          style={{ width }}
        >
          {options.map((option) => (
            <button
              key={String(option.value ?? 'default')}
              type="button"
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                value === option.value
                  ? 'bg-blue-500/20 text-blue-100'
                  : 'text-white/70 hover:bg-white/5 hover:text-white',
              )}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
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