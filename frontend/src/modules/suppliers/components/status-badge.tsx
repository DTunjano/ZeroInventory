import { Badge } from '@/shared/ui/badge'

interface StatusBadgeProps {
  isActive: boolean
  text?: { active: string; inactive: string }
}

export function SupplierStatusBadge({
  isActive,
  text = { active: 'Activo', inactive: 'Inactivo' },
}: StatusBadgeProps) {
  return (
    <Badge
      className={
        isActive
          ? 'border-green-500/30 bg-green-500/20 text-green-300 hover:bg-green-500/20'
          : 'border-red-500/20 bg-red-500/15 text-red-300 hover:bg-red-500/15'
      }
      variant="outline"
    >
      {isActive ? text.active : text.inactive}
    </Badge>
  )
}
