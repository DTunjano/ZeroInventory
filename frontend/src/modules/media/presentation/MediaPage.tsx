import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Sparkles, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import { useAuthStore } from '@/modules/auth/application/auth.store'
import { createMedia, deleteMedia, listMedia, toggleMediaStatus, updateMedia } from '@/modules/media/application/media.service'
import type { MediaEstado, MediaItem } from '@/modules/media/application/media.models'
import { MediaFormModal, type MediaFormValues } from './MediaFormModal'
import { MediaList } from './MediaList'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { ConfirmModal } from '@/shared/ui/modals/confirm-modal'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/utils'
import { useDebounce } from '@/shared/hooks/useDebounce'

type FilterState = 'all' | 'activo' | 'inactivo'

const PAGE_SIZE = 8

export function MediaPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const isAdmin = (user?.roles ?? []).some((role) => role.toUpperCase() === 'ADMIN')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [filter, setFilter] = useState<FilterState>('all')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<MediaItem | null>(null)
  const [deleting, setDeleting] = useState<MediaItem | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const query = useQuery({
    queryKey: ['media', page, debouncedSearch, filter],
    queryFn: () =>
      listMedia({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        estado: filter === 'all' ? undefined : (filter as MediaEstado),
        tipo: 'video',
        admin: true,
      }),
  })

  const createMutation = useMutation({
    mutationFn: createMedia,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['media'] })
      toast.success('Video subido correctamente 🎬')
      setFormOpen(false)
      setEditing(null)
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Error al subir el video, intenta nuevamente')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: MediaFormValues }) => updateMedia(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['media'] })
      toast.success('Video actualizado correctamente')
      setFormOpen(false)
      setEditing(null)
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'No se pudo actualizar el video')),
  })

  const toggleMutation = useMutation({
    mutationFn: toggleMediaStatus,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['media'] })
      toast.success('Estado actualizado')
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'No se pudo cambiar el estado')),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['media'] })
      toast.success('Video eliminado')
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'No se pudo eliminar el video')),
  })

  const items = query.data?.data ?? []
  const total = query.data?.total ?? 0
  const totalPages = query.data?.totalPages ?? 1
  const activeFilterCount = useMemo(() => (debouncedSearch ? 1 : 0) + (filter === 'all' ? 0 : 1), [debouncedSearch, filter])

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="absolute right-0 top-0 h-44 w-44 translate-x-1/3 -translate-y-1/3 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 -translate-x-1/3 translate-y-1/3 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Media promocional
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Videos promocionales</h1>
              <p className="max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                Gestiona los videos de portada con una interfaz limpia, rápida y lista para Cloudinary.
              </p>
            </div>
          </div>

          {isAdmin ? (
            <Button
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
              className="h-11 gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-400 hover:to-cyan-400"
            >
              <Plus className="h-4 w-4" />
              Nuevo video
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Buscar por título..."
            className="h-11 border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/35"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'activo', 'inactivo'] as FilterState[]).map((state) => (
            <button
              key={state}
              type="button"
              onClick={() => {
                setFilter(state)
                setPage(1)
              }}
              className={cn(
                'rounded-full border px-4 py-2 text-sm transition-colors',
                filter === state
                  ? 'border-blue-400/40 bg-blue-500/20 text-blue-100'
                  : 'border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white',
              )}
            >
              {state === 'all' ? 'Todos' : state === 'activo' ? 'Activos' : 'Inactivos'}
            </button>
          ))}

          <Badge className="border-white/10 bg-white/5 px-3 py-2 text-white/70">
            <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
            {activeFilterCount} filtro(s)
          </Badge>
        </div>
      </div>

      <MediaList
        items={items}
        isLoading={query.isLoading}
        isAdmin={isAdmin}
        onEdit={(media) => {
          setEditing(media)
          setFormOpen(true)
        }}
        onDelete={(media) => setDeleting(media)}
        onToggleStatus={(media) => toggleMutation.mutate(media.mediaId)}
      />

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
        <span>
          {total} video{total !== 1 ? 's' : ''} encontrados
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Anterior
          </Button>
          <span>
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <MediaFormModal
        open={formOpen}
        editing={editing}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        onSubmit={async (values) => {
          if (editing) {
            await updateMutation.mutateAsync({ id: editing.mediaId, values })
          } else {
            if (!values.file) {
              throw new Error('El video es requerido')
            }
            await createMutation.mutateAsync(values)
          }
        }}
      />

      <ConfirmModal
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title="Eliminar video"
        description={deleting ? `Se marcará como inactivo el video "${deleting.titulo}".` : 'Se marcará como inactivo.'}
        confirmText="Eliminar"
        confirmVariant="destructive"
        isConfirming={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleting) return
          deleteMutation.mutate(deleting.mediaId, { onSettled: () => setDeleting(null) })
        }}
      />
    </div>
  )
}
