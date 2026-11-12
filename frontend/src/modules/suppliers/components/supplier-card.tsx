import {
  Building,
  Mail,
  MapPin,
  MoreVertical,
  Pencil,
  Power,
  Phone,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { usePermissions } from '@/shared/hooks/usePermissions'
import type { Proveedor } from '../domain/supplier.entity'
import { useGetSuppliedProductCount } from '../application/hooks/useSuppliers'

export type SupplierCardProps = {
  proveedor: Proveedor
  onEdit: (id: number) => void
  onToggleStatus: (id: number) => void
  onDelete: (id: number) => void
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'PR'
  const [first = '', second = ''] = parts
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase()
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      className={
        isActive
          ? 'border-green-500/30 bg-green-500/20 text-green-300 hover:bg-green-500/20'
          : 'border-red-500/20 bg-red-500/15 text-red-300 hover:bg-red-500/15'
      }
      variant="outline"
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </Badge>
  )
}

export function SupplierCard({ proveedor, onEdit, onToggleStatus, onDelete }: SupplierCardProps) {
  const initials = getInitials(proveedor.nombre)
  const direccionPrincipal = proveedor.direcciones?.[0]
  const { canDelete, canDeactivate } = usePermissions()
  const suppliedQuery = useGetSuppliedProductCount(proveedor.proveedorId)
  const suppliedCount = proveedor.productosSuministrados ?? suppliedQuery.data

  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5 shadow-lg shadow-black/25 backdrop-blur-sm transition-colors hover:border-blue-500/30">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/90 text-lg font-semibold text-white">
            {initials}
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold leading-none text-white">
              {proveedor.nombre}
            </h3>
            {proveedor.nombreTitular && (
              <p className="text-sm text-zinc-400">{proveedor.nombreTitular}</p>
            )}
            <Badge className="border-blue-500/30 bg-blue-500/20 text-blue-200 hover:bg-blue-500/20">
              Proveedor
            </Badge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Acciones del proveedor"
              className="h-9 w-9 rounded-full border border-white/10 bg-transparent p-0 text-white/70 hover:bg-white/10 hover:text-white"
              variant="ghost"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-zinc-900">
            <DropdownMenuItem onClick={() => onEdit(proveedor.proveedorId)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            {canDeactivate && (
              <DropdownMenuItem onClick={() => onToggleStatus(proveedor.proveedorId)}>
                <Power className="mr-2 h-4 w-4" />
                {proveedor.isActive ? 'Desactivar' : 'Activar'}
              </DropdownMenuItem>
            )}
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-300 focus:bg-red-500/20 focus:text-red-200"
                  onClick={() => onDelete(proveedor.proveedorId)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="mt-6 space-y-2 text-[1.375rem] text-zinc-300">
        {proveedor.email && (
          <p className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-zinc-400" />
            <span className="truncate">{proveedor.email}</span>
          </p>
        )}
        {proveedor.telefono && (
          <p className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-zinc-400" />
            <span>{proveedor.telefono}</span>
          </p>
        )}
        {direccionPrincipal && (
          <p className="flex items-start gap-2">
            <MapPin className="h-5 w-5 shrink-0 text-zinc-400" />
            <span className="text-sm leading-tight">
              {direccionPrincipal.lineaDir}, {direccionPrincipal.barrio}
              {direccionPrincipal.codigoPostal && ` - ${direccionPrincipal.codigoPostal}`}
            </span>
          </p>
        )}
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm text-zinc-400">
            <Building className="h-4 w-4 text-zinc-500" />
            {typeof suppliedCount === 'number' ? (
              <span>{suppliedCount} productos suministrados</span>
            ) : (
              <span className="italic">{suppliedQuery.isPending ? 'Calculando trazabilidad…' : 'Trazabilidad no disponible'}</span>
            )}
          </p>
          <StatusBadge isActive={proveedor.isActive} />
        </div>
      </div>
    </article>
  )
}
