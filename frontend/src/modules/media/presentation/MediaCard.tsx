import { useState } from 'react'
import { Film, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import type { MediaItem } from '@/modules/media/application/media.models'
import { MediaActionsDropdown } from './MediaActionsDropdown'

interface MediaCardProps {
  media: MediaItem
  onEdit: (media: MediaItem) => void
  onDelete: (media: MediaItem) => void
  onToggleStatus: (media: MediaItem) => void
  isAdmin?: boolean
}

export function MediaCard({
  media,
  onEdit,
  onDelete,
  onToggleStatus,
  isAdmin = false,
}: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg',
        isHovered ? 'scale-[1.02]' : 'scale-100',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Preview */}
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
        {media.tipo === 'video' ? (
          <video
            src={media.url}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={media.url}
            alt={media.titulo}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge
            variant="default"
            className={cn(
              'text-[10px] font-medium',
              media.estado === 'activo'
                ? 'border-sky-500/25 bg-sky-500/15 text-sky-200'
                : 'bg-slate-500/20 text-slate-300 border-slate-500/30',
            )}
          >
            {media.estado === 'activo' ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
            Video
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-card-foreground line-clamp-1">{media.titulo}</h3>
          {media.descripcion && <p className="line-clamp-2 text-xs text-muted-foreground">{media.descripcion}</p>}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Orden: {media.orden}</span>
          <span className="uppercase">{media.tipo}</span>
        </div>

        {isAdmin && (
          <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {media.estado === 'activo' ? <Eye className="h-4 w-4 text-sky-400" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
              {media.estado === 'activo' ? 'Visible' : 'Oculto'}
            </div>
            <MediaActionsDropdown
              media={media}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          </div>
        )}
      </div>
    </div>
  )
}
