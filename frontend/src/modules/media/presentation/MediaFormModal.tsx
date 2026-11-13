import { useEffect, useMemo, useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import type { MediaItem } from '@/modules/media/application/media.models'

export interface MediaFormValues {
  tipo: 'video' | 'image'
  titulo: string
  descripcion: string
  file: File | null
}

interface MediaFormModalProps {
  open: boolean
  editing: MediaItem | null
  isSubmitting?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: MediaFormValues) => Promise<void> | void
}

const emptyValues: MediaFormValues = {
  tipo: 'video',
  titulo: '',
  descripcion: '',
  file: null,
}

export function MediaFormModal({
  open,
  editing,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: MediaFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [values, setValues] = useState<MediaFormValues>(emptyValues)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setValues(emptyValues)
      setPreviewUrl(null)
      setError(null)
      setDragActive(false)
      return
    }

    if (editing) {
      setValues({
        tipo: editing.tipo,
        titulo: editing.titulo,
        descripcion: editing.descripcion ?? '',
        file: null,
      })
      setPreviewUrl(editing.url)
      return
    }

    setValues(emptyValues)
    setPreviewUrl(null)
  }, [editing, open])

  useEffect(() => {
    if (!values.file) return

    const url = URL.createObjectURL(values.file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [values.file])

  const isEditing = !!editing
  const title = isEditing ? 'Editar video promocional' : 'Nuevo video promocional'

  const previewMode = useMemo(() => {
    if (values.file) return 'file'
    if (editing?.url) return 'current'
    return 'empty'
  }, [editing?.url, values.file])

  function handleFile(file: File | null) {
    if (!file) return

    const allowedTypes = ['video/mp4', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      setError('Formato no permitido. Usa MP4 o WebM.')
      return
    }

    setError(null)
    setValues((prev) => ({ ...prev, file }))
  }

  async function submitForm() {
    if (!values.titulo.trim()) {
      setError('El título es obligatorio.')
      return
    }

    if (!editing && !values.file) {
      setError('Debes seleccionar un video para crear el media.')
      return
    }

    setError(null)
    await onSubmit({
      tipo: values.tipo,
      titulo: values.titulo.trim(),
      descripcion: values.descripcion.trim(),
      file: values.file,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border bg-card text-foreground shadow-2xl shadow-black/50">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Sube el archivo desde el backend. No se expone la URL ni campos técnicos en el formulario.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="media-titulo">Título</Label>
            <Input
              id="media-titulo"
              value={values.titulo}
              onChange={(e) => setValues((prev) => ({ ...prev, titulo: e.target.value }))}
              placeholder="Video promocional principal"
              className="border-border bg-muted/50"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="media-descripcion">Descripción</Label>
            <Input
              id="media-descripcion"
              value={values.descripcion}
              onChange={(e) => setValues((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Texto breve para acompañar el video"
              className="border-border bg-muted/50"
            />
          </div>

          <div className="grid gap-3">
            <Label>Archivo</Label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragActive(false)
                handleFile(e.dataTransfer.files?.[0] ?? null)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'group relative flex min-h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-muted/50 px-4 py-6 text-center transition-all',
                dragActive ? 'border-blue-400 bg-blue-500/10' : 'border-border hover:border-blue-400/60 hover:bg-blue-500/8',
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />

              {previewMode === 'file' && values.file ? (
                <div className="relative w-full">
                  <video
                    src={previewUrl ?? undefined}
                    className="mx-auto max-h-64 w-full rounded-xl object-cover shadow-lg shadow-black/40"
                    controls
                    muted
                    playsInline
                  />
                  <div className="mt-3 text-sm text-muted-foreground">Vista previa del archivo seleccionado</div>
                </div>
              ) : previewMode === 'current' && editing?.url ? (
                <div className="relative w-full">
                  <video
                    src={editing.url}
                    className="mx-auto max-h-64 w-full rounded-xl object-cover shadow-lg shadow-black/40"
                    controls
                    muted
                    playsInline
                  />
                  <div className="mt-3 text-sm text-muted-foreground">Video actual</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted/50 text-muted-foreground ring-1 ring-white/10">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Arrastra un video o haz clic para seleccionarlo</p>
                    <p className="text-xs text-muted-foreground">Formatos permitidos: MP4 y WebM. El archivo se sube vía backend.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Se recomienda un archivo corto para la portada.</span>
              {values.file ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setValues((prev) => ({ ...prev, file: null }))
                    setPreviewUrl(editing?.url ?? null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Quitar archivo
                </button>
              ) : null}
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-3 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border bg-muted/50 text-foreground hover:bg-muted/50">
            Cancelar
          </Button>
          <Button
            onClick={() => void submitForm()}
            disabled={isSubmitting}
            className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-400 hover:to-cyan-400"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
