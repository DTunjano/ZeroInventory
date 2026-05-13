import { AlertCircle, Archive, TrendingDown, Package } from 'lucide-react'

export type StatCardVariant = 'total' | 'low' | 'critical' | 'out'

interface StatCardProps {
  variant: StatCardVariant
  label: string
  value: number | string
  description?: string
  isLoading?: boolean
}

const variantConfig: Record<StatCardVariant, {
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  iconColor: string
  accentBg: string
}> = {
  total: {
    icon: Archive,
    bgColor: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    accentBg: 'bg-blue-500/20',
  },
  low: {
    icon: TrendingDown,
    bgColor: 'bg-yellow-500/15',
    iconColor: 'text-yellow-400',
    accentBg: 'bg-yellow-500/20',
  },
  critical: {
    icon: AlertCircle,
    bgColor: 'bg-red-500/15',
    iconColor: 'text-red-400',
    accentBg: 'bg-red-500/20',
  },
  out: {
    icon: Package,
    bgColor: 'bg-gray-500/15',
    iconColor: 'text-gray-400',
    accentBg: 'bg-gray-500/20',
  },
}

export function StatCard({ variant, label, value, description, isLoading = false }: StatCardProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div className={`rounded-2xl border border-white/10 ${config.bgColor} p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-300">{label}</p>
          {isLoading ? (
            <div className="mt-2 h-9 w-20 animate-pulse rounded-md bg-white/10" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          )}
          {description && <p className="mt-1 text-xs text-zinc-400">{description}</p>}
        </div>
        <div className={`rounded-xl ${config.accentBg} p-3`}>
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>
      </div>
    </div>
  )
}
