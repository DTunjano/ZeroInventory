import { ChevronDown, ChevronUp } from 'lucide-react'

interface OrderToggleButtonProps {
  order: 'asc' | 'desc'
  onChange: (order: 'asc' | 'desc') => void
}

export function OrderToggleButton({ order, onChange }: OrderToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(order === 'asc' ? 'desc' : 'asc')}
      className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-border bg-muted/50 transition-colors hover:bg-muted/50"
      title={order === 'asc' ? 'Orden ascendente' : 'Orden descendente'}
      aria-label={order === 'asc' ? 'Orden ascendente' : 'Orden descendente'}
    >
      {order === 'asc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
    </button>
  )
}
