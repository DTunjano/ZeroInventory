import { useState } from 'react'
import type { MediaItem } from '@/modules/media/application/media.models'
import { MediaCard } from './MediaCard'
import { Skeleton } from '@/shared/ui/skeleton'

interface MediaListProps {
  items: MediaItem[]
  isLoading?: boolean
  isAdmin?: boolean
  onEdit: (media: MediaItem) => void
  onDelete: (media: MediaItem) => void
  onToggleStatus: (media: MediaItem) => void
}

export function MediaList({
  items,
  isLoading,
  isAdmin,
  onEdit,
  onDelete,
  onToggleStatus,
}: MediaListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground text-sm">
          No hay contenido multimedia registrado.
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <MediaCard
          key={item.mediaId}
          media={item}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  )
}
