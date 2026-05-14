import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Building, Mail, Phone, User } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { supplierService } from '../application/supplier.service'
import type { Proveedor, Direccion } from '../domain/supplier.entity'

interface SupplierFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proveedor?: Proveedor | null
  onSuccess?: () => void
}

export function SupplierFormModal({ open, onOpenChange, proveedor, onSuccess }: SupplierFormModalProps) {
  const isEditing = !!proveedor?.proveedorId

  const mutation = useMutation({
    mutationFn: (payload: any) => {
      if (isEditing && proveedor) {
        return supplierService.update(proveedor.proveedorId, payload)
      }
      return supplierService.create(payload)
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Proveedor actualizado' : 'Proveedor creado')
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, 'Error al guardar proveedor'))
    },
  })

  useEffect(() => {
    if (!open) {
      // Reset form cuando se cierra si es necesario
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      nombre: formData.get('nombre') as string,
      nombreTitular: (formData.get('nombreTitular') as string) || null,
      telefono: (formData.get('telefono') as string) || null,
      email: (formData.get('email') as string) || null,
    }
    mutation.mutate(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-zinc-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-zinc-300">
              Nombre de la empresa
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                id="nombre"
                name="nombre"
                defaultValue={proveedor?.nombre || ''}
                placeholder="Ej: Proveedor XYZ"
                className="pl-10 rounded-xl bg-zinc-950 border-white/10 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombreTitular" className="text-zinc-300">
              Nombre del titular
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                id="nombreTitular"
                name="nombreTitular"
                defaultValue={proveedor?.nombreTitular || ''}
                placeholder="Ej: Juan Pérez"
                className="pl-10 rounded-xl bg-zinc-950 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">
              Correo electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={proveedor?.email || ''}
                placeholder="proveedor@ejemplo.com"
                className="pl-10 rounded-xl bg-zinc-950 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-zinc-300">
              Teléfono
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                id="telefono"
                name="telefono"
                defaultValue={proveedor?.telefono || ''}
                placeholder="300 123 4567"
                className="pl-10 rounded-xl bg-zinc-950 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-zinc-300 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-xl bg-blue-600 px-6 hover:bg-blue-500"
            >
              {mutation.isPending
                ? 'Guardando...'
                : isEditing
                ? 'Actualizar'
                : 'Crear proveedor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
