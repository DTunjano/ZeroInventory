import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { Upload, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { http } from '@/infrastructure/http/http'

interface MediaUploaderProps {
  onUpload: (url: string, publicId: string) => void
  accept?: string
  className?: string
}

export function MediaUploader({ onUpload, accept = 'video/*,image/*', className }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(
    async (file: File) => {
      if (!file) return
      const reader = new FileReader()

      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await http.post('/cloudinary/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        const { secure_url, public_id } = response.data ?? {}
        onUpload(secure_url, public_id)
        toast.success('Archivo subido exitosamente')
      } catch {
        toast.error('Error al subir el archivo')
        setPreview(null)
      } finally {
        setUploading(false)
      }
    },
    [onUpload],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileChange(file)
    },
    [handleFileChange],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div className={cn('space-y-3', className)}>
      <input
        type="file"
        ref={inputRef}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileChange(file)
        }}
        accept={accept}
        className="hidden"
      />

      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 transition-all duration-200 hover:border-muted-foreground/50 hover:bg-muted',
            isDragging && 'border-blue-500 bg-blue-500/5',
            uploading && 'pointer-events-none opacity-60',
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted-foreground/10">
            {uploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm font-medium text-foreground">
              {uploading ? 'Subiendo...' : 'Arrastra un archivo o haz clic para subir'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Soporta videos e imágenes (max. 50MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border bg-card shadow-sm">
          <div className="aspect-video w-full bg-black">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-contain"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-foreground/5 text-foreground hover:bg-foreground/5"
            onClick={() => {
              setPreview(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
