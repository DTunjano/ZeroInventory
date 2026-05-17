import { useState } from 'react'
import { MoreVertical, Pencil, Eye, EyeOff, Trash2 } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

import type { MediaItem } from '@/modules/media/application/media.models'

interface MediaActionsDropdownProps {
  media: MediaItem
  onEdit: (media: MediaItem) => void
  onToggleStatus: (media: MediaItem) => void
  onDelete: (media: MediaItem) => void
}

export function MediaActionsDropdown({
  media,
  onEdit,
  onToggleStatus,
  onDelete,
}: MediaActionsDropdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 rounded-full text-white/60 hover:bg-white/10 hover:text-white',
            open ? 'bg-white/10 text-white' : '',
          )}
          aria-label="Acciones"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-48">
        <DropdownMenuItem onSelect={() => onEdit(media)} className="gap-3">
          <Pencil className="h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => onToggleStatus(media)} className="gap-3">
          {media.estado === 'activo' ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span>Desactivar</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span>Activar</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => onDelete(media)}
          className="gap-3 text-red-300 focus:bg-red-500/15 focus:text-red-200"
        >
          <Trash2 className="h-4 w-4" />
          <span>Eliminar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
