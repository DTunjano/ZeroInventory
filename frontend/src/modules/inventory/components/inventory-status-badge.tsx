import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import type { InventoryStatusType } from '../domain/inventory.models'
import { getInventoryStatusMeta } from '../domain/inventory.models'

interface InventoryStatusBadgeProps {
  status: InventoryStatusType
  size?: 'sm' | 'md'
}

const iconMap: Record<InventoryStatusType, React.ComponentType<{ className?: string }>> = {
  HEALTHY: CheckCircle2,
  LOW_STOCK: AlertTriangle,
  CRITICAL: AlertCircle,
  OUT_OF_STOCK: XCircle,
}

const colorMap: Record<InventoryStatusType, string> = {
  HEALTHY: 'border-green-500/30 bg-green-500/20 text-green-300 hover:bg-green-500/20',
  LOW_STOCK: 'border-yellow-500/30 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/20',
  CRITICAL: 'border-red-500/30 bg-red-500/20 text-red-300 hover:bg-red-500/20',
  OUT_OF_STOCK: 'border-gray-500/30 bg-gray-500/20 text-gray-300 hover:bg-gray-500/20',
}

export function InventoryStatusBadge({
  status,
  size = 'md',
}: InventoryStatusBadgeProps) {
  const meta = getInventoryStatusMeta(status)
  const Icon = iconMap[status]
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <Badge
      variant="outline"
      className={`${colorMap[status]} ${textSize} gap-1 font-medium`}
    >
      <Icon className={iconSize} />
      {meta.label}
    </Badge>
  )
}
