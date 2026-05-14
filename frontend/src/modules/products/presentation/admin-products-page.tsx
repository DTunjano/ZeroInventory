import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronDown, Image as ImageIcon, Package2, Search, Sparkles, Tags } from 'lucide-react'
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
import { generateSkuPreview } from '../domain/sku-preview'

import { getApiErrorMessage } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/utils'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'
import { ConfirmModal } from '@/shared/ui/modals/confirm-modal'
import { FormModal } from '@/shared/ui/modals/form-modal'
import { Badge } from '@/shared/ui/badge'

import { ViewToggle, type ViewMode } from './components/ViewToggle'
import { ProductCard } from './components/ProductCard'
import { ProductTable } from './components/ProductTable'

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
    proveedorId: p?.proveedorId ? String(p.proveedorId) : '',
    categoriaIds: [],
    cantidad: typeof p?.cantidad === 'number' ? String(p.cantidad) : '',
    precio: normalizeMoney(p?.precio),
    descripcion: p?.descripcion ?? '',
  }
}

export function AdminProductsPage() {
  const qc = useQueryClient()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null)
  const [confirmToggleActive, setConfirmToggleActive] = useState<Product | null>(null)
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const categoryPickerRef = useRef<HTMLDivElement | null>(null)

  const pageSize = 15 // Máximo 15 productos por página
  const queryKey = useMemo(() => ['products', currentPage, pageSize], [currentPage, pageSize])

  const productsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await listProducts({ page: currentPage, limit: pageSize })
      console.log('📦 Productos recibidos:', {
        total: result.total,
        page: result.page,
        limit: result.limit,
        data: result.data.map((p) => ({
          id: p.productoId,
          nombre: p.nombre,
          precio: p.precio,
          cantidad: p.cantidad,
          tipo_precio: typeof p.precio,
        })),
      })
      return result
    },
  })

  const imagesQuery = useQuery({
    queryKey: ['product-images', editing?.productoId],
    enabled: open && !!editing?.productoId,
    queryFn: () => listImagesByProduct(editing!.productoId),
  })

  // Query para obtener imágenes de todos los productos en la grid
  const allProductImagesQueries = useQuery({
    queryKey: ['all-product-images', productsQuery.data?.data?.map(p => p.productoId).join(',')],
    enabled: !!productsQuery.data?.data?.length,
    queryFn: async () => {
      const images: Record<number, string> = {}
      for (const product of productsQuery.data?.data ?? []) {
        try {
          const result = await listImagesByProduct(product.productoId)
          if (result.data?.[0]?.url) {
            images[product.productoId] = result.data[0].url
          }
        } catch {
          // Ignorar errores al obtener imágenes individuales
        }
      }
      return images
    },
    staleTime: 60_000,
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
    const record: Record<number, string> = {}
    for (const p of providersQuery.data ?? []) record[p.proveedorId] = p.nombre
    return record
  }, [providersQuery.data])

  const categoriesById = useMemo(() => {
    const record: Record<number, string> = {}
    for (const c of categoriesQuery.data ?? []) record[c.categoriaId] = c.nombre
    return record
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

  const nombreValue = form.watch('nombre')
  const skuPreview = useMemo(() => {
    if (!nombreValue) return null
    return generateSkuPreview(nombreValue)
  }, [nombreValue])

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

      const basePayload = {
        nombre: values.nombre,
        cantidad: values.cantidad,
        precio: values.precio,
        descripcion: values.descripcion,
        proveedorId: values.proveedorId,
      }

      const saved = editing
        ? await updateProduct(editing.productoId, { sku: editing.sku, ...basePayload })
        : await createProduct(basePayload)

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
    mutationFn: (product: Product) =>
      updateProduct(product.productoId, {
        sku: product.sku,
        nombre: product.nombre,
        cantidad: product.cantidad,
        precio: product.precio,
        descripcion: product.descripcion,
        proveedorId: product.proveedorId,
        isActive: false, // Soft delete
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey })
      toast.success('Producto eliminado')
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo eliminar el producto')),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: (product: Product) =>
      updateProduct(product.productoId, {
        sku: product.sku,
        nombre: product.nombre,
        cantidad: product.cantidad,
        precio: product.precio,
        descripcion: product.descripcion,
        proveedorId: product.proveedorId,
        isActive: !product.isActive,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey })
      toast.success('Producto actualizado')
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, 'No se pudo actualizar el producto')),
  })

  const selectedCategoriaIds = new Set(form.watch('categoriaIds'))
  const categoriaIdsReg = form.register('categoriaIds')

  const selectedCategoryNames = Array.from(selectedCategoriaIds)
    .map((id) => categoriesById[Number(id)])
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {productsQuery.data?.total || 0} producto{productsQuery.data?.total !== 1 ? 's' : ''} en total
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(null)
            setImageFile(null)
            form.reset(toDefaults(null))
            setOpen(true)
          }}
          className="gap-2"
        >
          + Agregar Producto
        </Button>
      </div>

      {/* Search & View Controls */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Buscar productos..."
            className="pl-9 border-white/10 bg-white/5"
          />
        </div>

        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Form Modal */}
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
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        description="Todos los campos marcados como obligatorios deben completarse."
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
                {(providersQuery.data ?? []).map((p) => {
                  const isInactive = !p.isActive
                  const productProveedorId = editing?.proveedorId
                  const isCurrentProductProvider = productProveedorId === p.proveedorId
                  const shouldShow = !isInactive || isCurrentProductProvider

                  return shouldShow ? (
                    <option key={p.proveedorId} value={String(p.proveedorId)}>
                      {p.nombre}
                      {isInactive && isCurrentProductProvider ? ' (Inactivo)' : ''}
                    </option>
                  ) : null
                })}
              </Select>
              {form.formState.errors.proveedorId?.message ? (
                <p className="text-xs text-destructive">
                  {String(form.formState.errors.proveedorId.message)}
                </p>
              ) : null}
            </div>

            <div className="relative grid gap-2" ref={categoryPickerRef}>
              <Label className="flex items-center gap-2">
                <Tags className="h-4 w-4 text-blue-400" />
                Categorías
              </Label>
              <button
                type="button"
                className="flex min-h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white transition-colors hover:border-blue-400 hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setCategoryPickerOpen((v) => !v)}
              >
                <span className={selectedCategoryNames.length ? 'text-white' : 'text-white/45'}>
                  {selectedCategoryNames.length
                    ? `${selectedCategoryNames.length} seleccionada(s)`
                    : 'Selecciona categorías…'}
                </span>
                <ChevronDown className="h-4 w-4 text-blue-300" />
              </button>

              <div className="flex flex-wrap gap-2">
                {Array.from(selectedCategoriaIds).map((id) => {
                  const name = categoriesById[Number(id)]
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
                <div className="absolute left-0 top-[calc(100%+0.5rem)] z-[60] w-full rounded-md border border-white/10 bg-gray-950/95 p-2 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <Input
                      placeholder="Buscar categoría…"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="h-9 border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/30"
                    />
                  </div>
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
                              'flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-white transition-colors hover:bg-blue-500/15',
                              selected ? 'bg-blue-500/20' : '',
                            )}
                            onClick={() => {
                              if (selected) removeCategoria(id)
                              else addCategoria(id)
                            }}
                          >
                            <span>{c.nombre}</span>
                            {selected ? (
                              <Check className="h-4 w-4 text-blue-300" />
                            ) : (
                              <span className="h-4 w-4" />
                            )}
                          </button>
                        )
                      })
                    ) : (
                      <div className="px-2 py-6 text-center text-sm text-white/60">
                        Sin resultados
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

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
              <Label className="flex items-center gap-2">
                <Package2 className="h-4 w-4 text-blue-400" />
                SKU
              </Label>
              <div
                className={cn(
                  'flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-mono transition-colors',
                  'bg-muted/40 border-muted-foreground/10',
                  'select-none',
                )}
              >
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-muted-foreground">
                  {editing?.sku ?? (skuPreview ?? '—')}
                </span>
                {!editing && skuPreview && (
                  <span className="ml-auto text-xs text-blue-400/80">
                    Preview
                  </span>
                )}
                {editing && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Autogenerado
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {!editing
                  ? 'El SKU se generará automáticamente al guardar el producto.'
                  : 'El SKU es autogenerado y no editable.'}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imagen" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-400" />
                Imagen
              </Label>
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={!!confirmDelete}
        onOpenChange={(v) => {
          if (!v) setConfirmDelete(null)
        }}
        title="Eliminar producto"
        description={
          confirmDelete
            ? `Vas a eliminar "${confirmDelete.nombre}". Esta acción marcará el producto como inactivo.`
            : 'Esta acción marcará el producto como inactivo.'
        }
        confirmText="Eliminar"
        isConfirming={deleteMutation.isPending}
        onConfirm={() => {
          if (!confirmDelete) return
          deleteMutation.mutate(confirmDelete, {
            onSettled: () => setConfirmDelete(null),
          })
        }}
      />

      {/* Confirm Toggle Active Modal */}
      <ConfirmModal
        open={!!confirmToggleActive}
        onOpenChange={(v) => {
          if (!v) setConfirmToggleActive(null)
        }}
        title={confirmToggleActive?.isActive ? 'Desactivar producto' : 'Activar producto'}
        description={
          confirmToggleActive
            ? confirmToggleActive.isActive
              ? `Vas a desactivar "${confirmToggleActive.nombre}".`
              : `Vas a activar "${confirmToggleActive.nombre}".`
            : ''
        }
        confirmText={confirmToggleActive?.isActive ? 'Desactivar' : 'Activar'}
        isConfirming={toggleActiveMutation.isPending}
        onConfirm={() => {
          if (!confirmToggleActive) return
          toggleActiveMutation.mutate(confirmToggleActive, {
            onSettled: () => setConfirmToggleActive(null),
          })
        }}
      />

      {/* Products Grid or Table */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {productsQuery.data?.data?.length ? (
            productsQuery.data.data.map((p) => {
              const imageUrl = allProductImagesQueries.data?.[p.productoId]
              const categoriaIds = productsCategoryIdsMapQuery.data?.[p.productoId] ?? []
              const categoryId = categoriaIds[0]
              const categoryName = categoryId ? categoriesById[categoryId] : undefined

              return (
                <ProductCard
                  key={p.productoId}
                  product={p}
                  {...(imageUrl && { imageUrl })}
                  {...(categoryName && { categoryName })}
                  onEdit={() => {
                    setEditing(p)
                    setImageFile(null)
                    setCategoryPickerOpen(false)
                    setCategorySearch('')
                    form.reset(toDefaults(p))
                    setOpen(true)
                  }}
                  onToggleActive={() => setConfirmToggleActive(p)}
                  onSoftDelete={() => setConfirmDelete(p)}
                  isLoading={deleteMutation.isPending || toggleActiveMutation.isPending}
                />
              )
            })
          ) : (
            <div className="col-span-full flex h-40 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
              <p className="text-sm text-white/60">
                {productsQuery.isLoading ? 'Cargando productos…' : 'Sin productos aún.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <ProductTable
          products={productsQuery.data?.data ?? []}
          imagesByProductId={allProductImagesQueries.data ?? {}}
          categoriesByProductId={
            productsQuery.data?.data
              ?.reduce(
                (acc, p) => {
                  const categoriaIds = productsCategoryIdsMapQuery.data?.[p.productoId] ?? []
                  const categoryId = categoriaIds[0]
                  if (categoryId) {
                    acc[p.productoId] = categoriesById[categoryId] ?? ''
                  }
                  return acc
                },
                {} as Record<number, string>,
              ) ?? {}
          }
          providersByProductId={providersById}
          onEdit={(product) => {
            setEditing(product)
            setImageFile(null)
            setCategoryPickerOpen(false)
            setCategorySearch('')
            form.reset(toDefaults(product))
            setOpen(true)
          }}
          onToggleActive={(product) => setConfirmToggleActive(product)}
          onSoftDelete={(product) => setConfirmDelete(product)}
          isLoading={deleteMutation.isPending || toggleActiveMutation.isPending}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={productsQuery.data?.total ?? 0}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}
