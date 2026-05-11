import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from '../application/products.use-cases'
import { uploadProductImage } from '../application/product-images.use-cases'
import type { Product } from '../domain/product.models'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

const formSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  sku: z.string().optional(),
  cantidad: z.number().min(0),
  precio: z.number().min(0),
  descripcion: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

function toDefaults(p?: Product | null): FormValues {
  return {
    nombre: p?.nombre ?? '',
    sku: p?.sku || '',
    cantidad: p?.cantidad ?? 0,
    precio: p?.precio ?? 0,
    descripcion: p?.descripcion ?? '',
  }
}

export function AdminProductsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const page = 1
  const limit = 10

  const queryKey = useMemo(() => ['products', page, limit], [page, limit])

  const productsQuery = useQuery({
    queryKey,
    queryFn: () => listProducts({ page, limit }),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toDefaults(null),
  })

  const upsertMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const base: {
        nombre: string
        cantidad: number
        precio: number
        descripcion: string | null
        sku?: string
      } = {
        nombre: values.nombre,
        cantidad: values.cantidad,
        precio: values.precio,
        descripcion: values.descripcion?.trim() ? values.descripcion.trim() : null,
      }

      const sku = values.sku?.trim()
      if (sku) {
        base.sku = sku
      }

      const saved = editing
        ? await updateProduct(editing.productoId, base)
        : await createProduct(base)

      if (imageFile) {
        await uploadProductImage(saved.productoId, imageFile)
      }

      return saved
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey })
      toast.success(editing ? 'Producto actualizado' : 'Producto creado')
      setOpen(false)
      setEditing(null)
      setImageFile(null)
      form.reset(toDefaults(null))
    },
    onError: () => toast.error('No se pudo guardar el producto'),
  })

  const deleteMutation = useMutation({
    mutationFn: (productoId: number) => deleteProduct(productoId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey })
      toast.success('Producto eliminado')
    },
    onError: () => toast.error('No se pudo eliminar el producto'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea, edita y gestiona el inventario.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditing(null)
                setImageFile(null)
                form.reset(toDefaults(null))
              }}
            >
              Nuevo producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
              <DialogDescription>
                Completa los campos principales. La imagen es opcional.
              </DialogDescription>
            </DialogHeader>

            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit((v) => upsertMutation.mutate(v))}
            >
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" {...form.register('nombre')} />
                {form.formState.errors.nombre?.message ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.nombre.message}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" {...form.register('sku')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    {...form.register('cantidad', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="precio">Precio</Label>
                  <Input
                    id="precio"
                    type="number"
                    {...form.register('precio', { valueAsNumber: true })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="imagen">Imagen</Label>
                  <Input
                    id="imagen"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input id="descripcion" {...form.register('descripcion')} />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending ? 'Guardando…' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsQuery.data?.data?.length ? (
              productsQuery.data.data.map((p) => (
                <TableRow key={p.productoId}>
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{p.sku || '—'}</TableCell>
                  <TableCell className="text-right">{p.cantidad}</TableCell>
                  <TableCell className="text-right">{p.precio}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(p)
                          setImageFile(null)
                          form.reset(toDefaults(p))
                          setOpen(true)
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(p.productoId)}
                        disabled={deleteMutation.isPending}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  {productsQuery.isLoading
                    ? 'Cargando productos…'
                    : 'Sin productos aún.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
