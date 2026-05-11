import { useEffect, useMemo, useRef, useState } from 'react'
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
import {
  listImagesByProduct,
  updateProductImage,
  uploadProductImage,
} from '../application/product-images.use-cases'
import { listCategories } from '../application/list-categories.use-case'
import { listProductCategoryIds } from '../application/list-product-categories.use-case'
import { listProviders } from '../application/list-providers.use-case'
import { listCategoryIdsByProductIds } from '../application/list-category-products-by-product.use-case'
import { setProductCategories } from '../application/set-product-categories.use-case'
import type { Product } from '../domain/product.models'

import { getApiErrorMessage } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/utils'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { ConfirmModal } from '@/shared/ui/modals/confirm-modal'
import { FormModal } from '@/shared/ui/modals/form-modal'
import { Badge } from '@/shared/ui/badge'

function sanitizeIntString(raw: string): string {
  return raw.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '')
}

function sanitizeMoneyString(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, '')
  if (!cleaned) return ''

  const parts = cleaned.split('.')
  const intPart = (parts[0] ?? '').replace(/^0+(?=\d)/, '')
  const decPart = parts.slice(1).join('').slice(0, 2)

  if (cleaned.startsWith('.') && !intPart) {
    return decPart.length ? `0.${decPart}` : '0.'
  }

  if (parts.length > 1) {
    return `${intPart || '0'}.${decPart}`
  }

  return intPart
}


function normalizeMoney(value: unknown): string {
  if (value === null || value === undefined) return ''

  if (typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'string') {
    return sanitizeMoneyString(value)
  }

  return ''
}

const formSchema = z.object({
  nombre: z.string().trim().min(1, 'Nombre requerido'),
  sku: z.string().trim().min(1, 'SKU requerido'),
  proveedorId: z
    .string()
    .min(1, 'Proveedor requerido')
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n) && n > 0, 'Proveedor inválido'),
  categoriaIds: z
    .array(z.string())
    .min(1, 'Selecciona al menos una categoría')
    .transform((arr) => arr.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0)),
  cantidad: z
    .string()
    .transform((v) => sanitizeIntString(v))
    .refine((v) => v.length > 0, 'Stock requerido')
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n) && n >= 0, 'Stock inválido'),
  precio: z
    .string()
    .transform((v) => sanitizeMoneyString(v))
    .refine((v) => v.length > 0, 'Precio requerido')
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n) && n > 0, 'Precio inválido'),
  descripcion: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
})

type FormInput = z.input<typeof formSchema>
type FormValues = z.output<typeof formSchema>

function toDefaults(p?: Product | null): FormInput {
  return {
    nombre: p?.nombre ?? '',
    sku: p?.sku ?? '',
    proveedorId: p?.proveedorId ? String(p.proveedorId) : '',
    categoriaIds: [],
    cantidad: typeof p?.cantidad === 'number' ? String(p.cantidad) : '',
    precio: normalizeMoney(p?.precio), // Asegura que el precio se muestre con el formato correcto
    descripcion: p?.descripcion ?? '',
  }
}

export function AdminProductsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null)
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const categoryPickerRef = useRef<HTMLDivElement | null>(null)

  const page = 1
  const limit = 10

  const queryKey = useMemo(() => ['products', page, limit], [page, limit])

  const productsQuery = useQuery({
    queryKey,
    queryFn: () => listProducts({ page, limit }),
  })

  const imagesQuery = useQuery({
    queryKey: ['product-images', editing?.productoId],
    enabled: open && !!editing?.productoId,
    queryFn: () => listImagesByProduct(editing!.productoId),
  })

  const providersQuery = useQuery({
    queryKey: ['providers'],
    queryFn: () => listProviders({ page: 1, limit: 100 }),
    staleTime: 60_000,
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories({ page: 1, limit: 100 }),
    staleTime: 60_000,
  })

  const productsCategoryIdsMapQuery = useQuery({
    queryKey: [
      'category-ids-by-products',
      (productsQuery.data?.data ?? []).map((p) => p.productoId),
    ],
    enabled: !!productsQuery.data?.data?.length,
    queryFn: () =>
      listCategoryIdsByProductIds(
        (productsQuery.data?.data ?? []).map((p) => p.productoId),
      ),
    staleTime: 30_000,
  })

  const productCategoryIdsQuery = useQuery({
    queryKey: ['product-category-ids', editing?.productoId],
    enabled: open && !!editing?.productoId,
    queryFn: () => listProductCategoryIds(editing!.productoId),
  })

  const existingImage = imagesQuery.data?.data?.[0] ?? null

  const providersById = useMemo(() => {
    const map = new Map<number, string>()
    for (const p of providersQuery.data ?? []) map.set(p.proveedorId, p.nombre)
    return map
  }, [providersQuery.data])

  const categoriesById = useMemo(() => {
    const map = new Map<number, string>()
    for (const c of categoriesQuery.data ?? []) map.set(c.categoriaId, c.nombre)
    return map
  }, [categoriesQuery.data])

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(imageFile)
    setImagePreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  useEffect(() => {
    if (!categoryPickerOpen) return

    function onPointerDown(e: PointerEvent) {
      const el = categoryPickerRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) {
        setCategoryPickerOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [categoryPickerOpen])

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toDefaults(null),
  })

  useEffect(() => {
    if (!open) return
    if (!editing) return
    const ids = productCategoryIdsQuery.data
    if (!ids) return
    form.setValue(
      'categoriaIds',
      ids.map(String),
      { shouldValidate: true },
    )
  }, [editing, form, open, productCategoryIdsQuery.data])

  // Sincronizar todos los campos del producto cuando se abre para editar
  useEffect(() => {
    if (!open) return
    if (!editing) return
    
    const defaults = toDefaults(editing)
    form.reset(defaults)
  }, [editing, open, form])

  const upsertMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      let hasExistingImage = !!existingImage?.url

      if (editing && !imageFile && !hasExistingImage) {
        const current = await listImagesByProduct(editing.productoId)
        hasExistingImage = !!current.data?.[0]?.url
      }

      if (!imageFile && !hasExistingImage) {
        throw new Error('La imagen del producto es obligatoria')
      }

      const base: {
        nombre: string
        cantidad: number
        precio: number
        descripcion: string | null
        sku: string
        proveedorId: number
      } = {
        nombre: values.nombre,
        cantidad: values.cantidad,
        precio: values.precio,
        descripcion: values.descripcion,
        sku: values.sku,
        proveedorId: values.proveedorId,
      }

      const saved = editing
        ? await updateProduct(editing.productoId, base)
        : await createProduct(base)

      if (imageFile) {
        if (editing) {
          const current = await listImagesByProduct(saved.productoId)
          const currentImageId = current.data?.[0]?.imagenProductoId
          if (currentImageId) {
            await updateProductImage(currentImageId, imageFile)
          } else {
            await uploadProductImage(saved.productoId, imageFile)
          }
        } else {
          await uploadProductImage(saved.productoId, imageFile)
        }
      }

      await setProductCategories({
        productoId: saved.productoId,
        categoriaIds: values.categoriaIds,
      })

      return saved
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey })
      await qc.invalidateQueries({ queryKey: ['product-images'] })
      await qc.invalidateQueries({ queryKey: ['product-category-ids'] })
      toast.success(editing ? 'Producto actualizado' : 'Producto creado')
      setOpen(false)
      setEditing(null)
      setImageFile(null)
      setImagePreviewUrl(null)
      form.reset(toDefaults(null))
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo guardar el producto')),
  })

  const deleteMutation = useMutation({
    mutationFn: (productoId: number) => deleteProduct(productoId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey })
      toast.success('Producto eliminado')
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo eliminar el producto')),
  })

  const modalTitle = editing ? 'Editar producto' : 'Nuevo producto'
  const modalDescription = 'Todos los campos marcados como obligatorios deben completarse.'

  const selectedCategoriaIds = new Set(form.watch('categoriaIds'))
  const categoriaIdsReg = form.register('categoriaIds')

  const selectedCategoryNames = Array.from(selectedCategoriaIds)
    .map((id) => categoriesById.get(Number(id)))
    .filter(Boolean) as string[]

  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase()
    const all = categoriesQuery.data ?? []
    if (!q) return all
    return all.filter((c) => c.nombre.toLowerCase().includes(q))
  }, [categoriesQuery.data, categorySearch])

  function setCategoriaIds(next: string[]) {
    form.setValue('categoriaIds', next, { shouldValidate: true, shouldDirty: true })
  }

  function addCategoria(id: string) {
    const next = new Set(selectedCategoriaIds)
    next.add(id)
    setCategoriaIds(Array.from(next))
  }

  function removeCategoria(id: string) {
    const next = Array.from(selectedCategoriaIds).filter((x) => x !== id)
    setCategoriaIds(next)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea, edita y gestiona el inventario.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(null)
            setImageFile(null)
            form.reset(toDefaults(null))
            setOpen(true)
          }}
        >
          Nuevo producto
        </Button>
      </div>

      <FormModal
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) {
            setEditing(null)
            setImageFile(null)
            setImagePreviewUrl(null)
            setCategoryPickerOpen(false)
            setCategorySearch('')
            form.reset(toDefaults(null))
          }
        }}
        title={modalTitle}
        description={modalDescription}
        isSubmitting={upsertMutation.isPending}
        onSubmit={form.handleSubmit((v) => upsertMutation.mutate(v))}
      >
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" {...form.register('nombre')} />
            {form.formState.errors.nombre?.message ? (
              <p className="text-xs text-destructive">{form.formState.errors.nombre.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="precio">Precio</Label>
              <Input
                id="precio"
                inputMode="decimal"
                {...form.register('precio', {
                  onChange: (e) => {
                    const sanitized = sanitizeMoneyString(e.target.value)
                    form.setValue('precio', sanitized, { shouldValidate: false })
                  },
                })}
              />
              {form.formState.errors.precio?.message ? (
                <p className="text-xs text-destructive">
                  {String(form.formState.errors.precio.message)}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cantidad">Stock</Label>
              <Input
                id="cantidad"
                inputMode="numeric"
                {...form.register('cantidad', {
                  onChange: (e) => {
                    const sanitized = sanitizeIntString(e.target.value)
                    form.setValue('cantidad', sanitized, { shouldValidate: false })
                  },
                })}
              />
              {form.formState.errors.cantidad?.message ? (
                <p className="text-xs text-destructive">
                  {String(form.formState.errors.cantidad.message)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="proveedorId">Proveedor</Label>
              <Select id="proveedorId" {...form.register('proveedorId')}>
                <option value="">Selecciona un proveedor…</option>
                {(providersQuery.data ?? []).map((p) => (
                  <option key={p.proveedorId} value={String(p.proveedorId)}>
                    {p.nombre}
                  </option>
                ))}
              </Select>
              {form.formState.errors.proveedorId?.message ? (
                <p className="text-xs text-destructive">
                  {String(form.formState.errors.proveedorId.message)}
                </p>
              ) : null}
            </div>

            <div className="relative grid gap-2" ref={categoryPickerRef}>
              <Label>Categorías</Label>
              <button
                type="button"
                className="flex min-h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => setCategoryPickerOpen((v) => !v)}
              >
                <span className={selectedCategoryNames.length ? 'text-foreground' : 'text-muted-foreground'}>
                  {selectedCategoryNames.length
                    ? `${selectedCategoryNames.length} seleccionada(s)`
                    : 'Selecciona categorías…'}
                </span>
                <span className="text-muted-foreground">▾</span>
              </button>

              <div className="flex flex-wrap gap-2">
                {Array.from(selectedCategoriaIds).map((id) => {
                  const name = categoriesById.get(Number(id))
                  if (!name) return null
                  return (
                    <Badge key={id} variant="secondary" className="gap-2">
                      <span>{name}</span>
                      <button
                        type="button"
                        className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground"
                        onClick={() => removeCategoria(id)}
                        aria-label={`Quitar ${name}`}
                      >
                        ×
                      </button>
                    </Badge>
                  )
                })}
              </div>

              {categoryPickerOpen ? (
                <div className="absolute left-0 top-[calc(100%+0.5rem)] z-[60] w-full rounded-md border bg-white p-2 shadow-lg">
                  <Input
                    placeholder="Buscar categoría…"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="h-9"
                  />
                  <div className="mt-2 max-h-56 overflow-auto">
                    {filteredCategories.length ? (
                      filteredCategories.map((c) => {
                        const id = String(c.categoriaId)
                        const selected = selectedCategoriaIds.has(id)
                        return (
                          <button
                            key={c.categoriaId}
                            type="button"
                            className={cn(
                              'flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-accent',
                              selected ? 'bg-primary/10' : '',
                            )}
                            onClick={() => {
                              if (selected) removeCategoria(id)
                              else addCategoria(id)
                            }}
                          >
                            <span>{c.nombre}</span>
                            <span className={selected ? 'text-primary' : 'text-muted-foreground'}>
                              {selected ? '✓' : ''}
                            </span>
                          </button>
                        )
                      })
                    ) : (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        Sin resultados
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* RHF: marca el campo como registrado */}
              <input type="hidden" name={categoriaIdsReg.name} ref={categoriaIdsReg.ref} />

              {form.formState.errors.categoriaIds?.message ? (
                <p className="text-xs text-destructive">
                  {String(form.formState.errors.categoriaIds.message)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...form.register('sku')} />
              {form.formState.errors.sku?.message ? (
                <p className="text-xs text-destructive">{form.formState.errors.sku.message}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imagen">Imagen</Label>
              <Input
                id="imagen"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
              <div className="mt-2 rounded-lg border bg-card p-2">
                <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-md bg-muted/30">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Preview de imagen"
                      className="h-full w-full object-contain"
                    />
                  ) : existingImage?.url ? (
                    <img
                      src={existingImage.url}
                      alt="Imagen actual del producto"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      Sin imagen
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input id="descripcion" {...form.register('descripcion')} />
          </div>
        </div>
      </FormModal>

      <ConfirmModal
        open={!!confirmDelete}
        onOpenChange={(v) => {
          if (!v) setConfirmDelete(null)
        }}
        title="Eliminar producto"
        description={
          confirmDelete
            ? `Vas a eliminar “${confirmDelete.nombre}”. Esta acción no se puede deshacer.`
            : 'Esta acción no se puede deshacer.'
        }
        confirmText="Eliminar"
        isConfirming={deleteMutation.isPending}
        onConfirm={() => {
          if (!confirmDelete) return
          deleteMutation.mutate(confirmDelete.productoId, {
            onSettled: () => setConfirmDelete(null),
          })
        }}
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Categorías</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsQuery.data?.data?.length ? (
              productsQuery.data.data.map((p) => {
                const providerName = p.proveedorId
                  ? (providersById.get(p.proveedorId) ?? '—')
                  : '—'
                const categoriaIds = productsCategoryIdsMapQuery.data?.[p.productoId] ?? []
                const categoriaNames = categoriaIds
                  .map((id) => categoriesById.get(id))
                  .filter(Boolean) as string[]

                return (
                  <TableRow key={p.productoId}>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{p.sku || '—'}</TableCell>
                    <TableCell className="text-right">{p.cantidad}</TableCell>
                    <TableCell className="text-right">{p.precio}</TableCell>
                    <TableCell className="text-muted-foreground">{providerName}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {categoriaNames.length ? (
                          categoriaNames.map((name) => (
                            <Badge key={`${p.productoId}-${name}`} variant="secondary">
                              {name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(p)
                            setImageFile(null)
                            setCategoryPickerOpen(false)
                            setCategorySearch('')
                            form.reset(toDefaults(p))
                            setOpen(true)
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setConfirmDelete(p)}
                          disabled={deleteMutation.isPending}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
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
