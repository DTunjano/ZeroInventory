import {
  Mail,
  MoreVertical,
  Pencil,
  Phone,
  Power,
  UserCircle2,
} from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { usePermissions } from '@/shared/hooks/usePermissions'
import type { Empleado as Employee } from '../services/employee.service'

export type EmployeeCardProps = {
  empleado: Employee
  onEdit: (id: number) => void
  onToggleStatus: (id: number) => void
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return 'EM'
  const [first = '', second = ''] = parts
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase()
}

function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible'
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function StatusBadge({ estado }: { estado: Employee['estado'] }) {
  const active = estado === 'ACTIVO'

  return (
    <Badge
      className={
        active
          ? 'border-green-500/30 bg-green-500/20 text-green-300 hover:bg-green-500/20'
          : 'border-red-500/20 bg-red-500/15 text-red-300 hover:bg-red-500/15'
      }
      variant="outline"
    >
      {active ? 'Activo' : 'Inactivo'}
    </Badge>
  )
}

export function EmployeeCard({
  empleado,
  onEdit,
  onToggleStatus,
}: EmployeeCardProps) {
  const { canDeactivate } = usePermissions()
  const displayName = empleado.nombreCompleto?.trim() || empleado.nombre
  const initials = getInitials(displayName)

  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5 shadow-lg shadow-black/25 backdrop-blur-sm transition-colors hover:border-blue-500/30">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/90 text-lg font-semibold text-white">
            {initials}
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold leading-none text-white">
              {displayName}
            </h3>
            <Badge className="border-blue-500/30 bg-blue-500/20 text-blue-200 hover:bg-blue-500/20">
              Empleado
            </Badge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Acciones del empleado"
              className="h-9 w-9 rounded-full border border-white/10 bg-transparent p-0 text-white/70 hover:bg-white/10 hover:text-white"
              variant="ghost"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-zinc-900">
            <DropdownMenuItem onClick={() => onEdit(empleado.empleadoId)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            {canDeactivate && (
              <DropdownMenuItem onClick={() => onToggleStatus(empleado.empleadoId)}>
                <Power className="mr-2 h-4 w-4" />
                {empleado.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="mt-6 space-y-2 text-[1.375rem] text-zinc-300">
        <p className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-zinc-400" />
          <span className="truncate">{empleado.email}</span>
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-zinc-400" />
          <span>{empleado.telefono || 'Sin teléfono registrado'}</span>
        </p>
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm text-zinc-400">
            <UserCircle2 className="h-4 w-4 text-zinc-500" />
            Creado el {formatDate(empleado.createdAt)}
          </p>
          <StatusBadge estado={empleado.estado} />
        </div>
      </div>
    </article>
  )
}