import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import {
  listProducts,
  updateProduct,
} from '@/modules/products/application/products.use-cases'
import { listProviders } from '@/modules/products/application/list-providers.use-case'
import type { Product } from '@/modules/products/domain/product.models'

import { getApiErrorMessage } from '@/shared/lib/api-error'
import { Button } from '@/shared/ui/button'
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
import { FormModal } from '@/shared/ui/modals/form-modal'

const editSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  sku: z.string().min(1, 'SKU requerido'),
  cantidad: z.number().min(0),
  precio: z.number().min(0),
  descripcion: z.string().optional(),
})

type EditValues = z.infer<typeof editSchema>

const stockSchema = z.object({
  cantidad: z.number().min(0),
})

type StockValues = z.infer<typeof stockSchema>

function toEditDefaults(p?: Product | null): EditValues {
  return {
    nombre: p?.nombre ?? '',
    sku: p?.sku ?? '',
    cantidad: p?.cantidad ?? 0,
    precio: p?.precio ?? 0,
    descripcion: p?.descripcion ?? '',
  }
}

function toStockDefaults(p?: Product | null): StockValues {
  return {
    cantidad: p?.cantidad ?? 0,
  }
}

export function EmployeeProductsPage() {
  const qc = useQueryClient()
  const [openEdit, setOpenEdit] = useState(false)
  const [openStock, setOpenStock] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const page = 1
  const limit = 10
  const queryKey = useMemo(() => ['products', page, limit], [page, limit])

  const productsQuery = useQuery({
    queryKey,
    queryFn: () => listProducts({ page, limit }),
  })

  const providersQuery = useQuery({
    queryKey: ['providers'],
    queryFn: () => listProviders({ page: 1, limit: 100 }),
    staleTime: 60_000,
  })

  const providersById = useMemo(() => {
    const map = new Map<number, string>()
    for (const p of providersQuery.data ?? []) map.set(p.proveedorId, p.nombre)
    return map
  }, [providersQuery.data])

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: toEditDefaults(null),
  })

  const stockForm = useForm<StockValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: toStockDefaults(null),
  })

  const editMutation = useMutation({
    mutationFn: async (values: EditValues) => {
      if (!editing) throw new Error('No hay producto en edición')
      return updateProduct(editing.productoId, {
        nombre: values.nombre,
        sku: values.sku.trim(),
        cantidad: values.cantidad,
        precio: values.precio,
        descripcion: values.descripcion?.trim() ? values.descripcion.trim() : null,
      })
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey })
      toast.success('Producto actualizado')
      setOpenEdit(false)
      setEditing(null)
      editForm.reset(toEditDefaults(null))
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo actualizar el producto')),
  })

  const stockMutation = useMutation({
    mutationFn: async (values: StockValues) => {
      if (!editing) throw new Error('No hay producto seleccionado')
      return updateProduct(editing.productoId, { cantidad: values.cantidad })
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey })
      toast.success('Inventario actualizado')
      setOpenStock(false)
      setEditing(null)
      stockForm.reset(toStockDefaults(null))
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo actualizar el inventario')),
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vista de productos (empleado) según permisos.
        </p>
      </div>

      <FormModal
        open={openEdit}
        onOpenChange={(v) => {
          setOpenEdit(v)
          if (!v) {
            setEditing(null)
            editForm.reset(toEditDefaults(null))
          }
        }}
        title="Editar producto"
        description="Actualiza campos del producto."
        isSubmitting={editMutation.isPending}
        onSubmit={editForm.handleSubmit((v) => editMutation.mutate(v))}
        contentClassName="max-w-3xl"
      >
        <div className="grid gap-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" {...editForm.register('nombre')} />
          {editForm.formState.errors.nombre?.message ? (
            <p className="text-xs text-destructive">{editForm.formState.errors.nombre.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...editForm.register('sku')} />
            {editForm.formState.errors.sku?.message ? (
              <p className="text-xs text-destructive">{editForm.formState.errors.sku.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input
              id="cantidad"
              type="number"
              {...editForm.register('cantidad', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="precio">Precio</Label>
            <Input
              id="precio"
              type="number"
              {...editForm.register('precio', { valueAsNumber: true })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input id="descripcion" {...editForm.register('descripcion')} />
          </div>
        </div>
      </FormModal>

      <FormModal
        open={openStock}
        onOpenChange={(v) => {
          setOpenStock(v)
          if (!v) {
            setEditing(null)
            stockForm.reset(toStockDefaults(null))
          }
        }}
        title="Actualizar stock"
        description="Ajusta la cantidad disponible del producto."
        isSubmitting={stockMutation.isPending}
        submitText="Actualizar"
        onSubmit={stockForm.handleSubmit((v) => stockMutation.mutate(v))}
        contentClassName="max-w-lg"
      >
        <div className="grid gap-2">
          <Label htmlFor="stock">Cantidad</Label>
          <Input
            id="stock"
            type="number"
            {...stockForm.register('cantidad', { valueAsNumber: true })}
          />
        </div>
      </FormModal>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead>Proveedor</TableHead>
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
                  <TableCell className="text-muted-foreground">
                    {p.proveedorId
                      ? (providersById.get(p.proveedorId) ?? `#${p.proveedorId}`)
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(p)
                          editForm.reset(toEditDefaults(p))
                          setOpenEdit(true)
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(p)
                          stockForm.reset(toStockDefaults(p))
                          setOpenStock(true)
                        }}
                      >
                        Stock
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  {productsQuery.isLoading
                    ? 'Cargando productos…'
                    : productsQuery.isError
                      ? 'Error al cargar productos'
                      : 'No hay productos disponibles'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
