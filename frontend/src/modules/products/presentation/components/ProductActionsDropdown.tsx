import { useState } from 'react'
import { MoreVertical, Edit, Archive, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { usePermissions } from '@/shared/hooks/usePermissions'
import type { Product } from '../../domain/product.models'

export interface ProductActionsDropdownProps {
  product: Product
  onEdit: () => void
  onToggleActive: () => void
  onSoftDelete: () => void
  isLoading?: boolean
}

/**
 * ProductActionsDropdown - Menú de 3 puntos para acciones de producto
 *
 * Domain: Presentation Component
 * Responsabilidad: Mostrar menú de acciones (Edit, Activate/Deactivate, Delete soft)
 * Controlado por permisos: ADMIN puede todo, EMPLOYEE puede editar/desactivar pero NO eliminar.
 */
export function ProductActionsDropdown({
  product,
  onEdit,
  onToggleActive,
  onSoftDelete,
  isLoading = false,
}: ProductActionsDropdownProps) {
  const [open, setOpen] = useState(false)
  const { canDelete, canDeactivate } = usePermissions()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isLoading}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-md',
            'text-white/60 hover:text-white hover:bg-white/10',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
          aria-label="Opciones"
          title="Más acciones"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-48">
        <DropdownMenuItem
          onSelect={() => {
            onEdit()
          }}
          disabled={isLoading}
          className="gap-3"
        >
          <Edit className="w-4 h-4" />
          <span>Editar</span>
        </DropdownMenuItem>

        {canDeactivate && (
          <DropdownMenuItem
            onSelect={() => {
              onToggleActive()
            }}
            disabled={isLoading}
            className="gap-3"
          >
            <Archive className="w-4 h-4" />
            <span>{product.isActive ? 'Desactivar' : 'Activar'}</span>
          </DropdownMenuItem>
        )}

        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                onSoftDelete()
              }}
              disabled={isLoading}
              className="gap-3 text-red-300 focus:text-red-200 focus:bg-red-500/15"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
