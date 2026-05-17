import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/modules/auth/application/auth.store'
import { addToCart, getMyCart } from '@/modules/cart/application/cart.use-cases'
import { useCartStore } from '@/modules/cart/application/cart.store'
import { listProducts } from '@/modules/products/application/products.use-cases'
import { listImagesByProduct } from '@/modules/products/application/product-images.use-cases'
import { listCategories } from '@/modules/products/application/list-categories.use-case'
import { CategoryFilterDropdown } from '@/modules/products/presentation/components/CategoryFilterDropdown'
import { SortDropdown } from '@/modules/products/presentation/components/SortDropdown'
import { OrderToggleButton } from '@/modules/products/presentation/components/OrderToggleButton'
import { ClearFiltersButton } from '@/modules/products/presentation/components/ClearFiltersButton'
import type { Product } from '@/modules/products/domain/product.models'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Input } from '@/shared/ui/input'
import { FloatingCartButton } from '@/shared/components/FloatingCartButton'
import { useNavigate, useLocation } from 'react-router-dom'
import { Package, ShoppingCart, Sparkles, Tag, Search, CheckCircle, AlertTriangle, XCircle, ArrowLeft } from 'lucide-react'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useState, useEffect, useMemo, useRef } from 'react'

import { MediaHero } from '@/modules/media/presentation/MediaHero'
import { useStoreHeroVideo } from '@/modules/media/application/media.hooks'

const STOCK_THRESHOLD = 150

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

type StockStatus = 'available' | 'low' | 'out'

function getStockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return 'out'
  if (quantity <= STOCK_THRESHOLD) return 'low'
  return 'available'
}

function StockBadge({ quantity }: { quantity: number }) {
  const status = getStockStatus(quantity)

  const config = {
    available: {
      label: 'Disponible',
      className: 'border-green-500/30 bg-green-500/10 text-green-400',
      icon: CheckCircle,
    },
    low: {
      label: 'Últimas unidades',
      className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      icon: AlertTriangle,
    },
    out: {
      label: 'Sin stock',
      className: 'border-red-500/30 bg-red-500/10 text-red-400',
      icon: XCircle,
    },
  }

  const { label, className, icon: Icon } = config[status]

  return (
    <div className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]', className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const status = useAuthStore((s) => s.status)
  const navigate = useNavigate()
  const imageQuery = useQuery({
    queryKey: ['product-images', product.productoId],
    queryFn: () => listImagesByProduct(product.productoId),
  })

  const imageUrl = imageQuery.data?.data?.[0]?.url ?? null
  const stockStatus = getStockStatus(product.cantidad)
  const isOutOfStock = stockStatus === 'out'
  const formattedPrice = formatPrice(product.precio)

  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-card via-card to-card/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-2xl hover:shadow-primary/10"
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '420px',
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-sky-400 to-emerald-400 opacity-80" />

      <div className="p-3 sm:p-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.nombre}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              <div className="space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-foreground/70 ring-1 ring-white/10">
                  {imageQuery.isLoading ? (
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  ) : (
                    <Package className="h-5 w-5" />
                  )}
                </div>
                <div>{imageQuery.isLoading ? 'Cargando imagen…' : 'Sin imagen disponible'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="space-y-2">
          <StockBadge quantity={product.cantidad} />
          <div className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground sm:text-[1.05rem]">
            {product.nombre}
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Precio
            </div>
            <div className="text-lg font-semibold text-foreground">{formattedPrice}</div>
          </div>

          <Button
            className="h-11 w-full rounded-xl font-semibold shadow-sm transition-transform duration-200 group-hover:translate-y-[-1px]"
            disabled={isOutOfStock}
            onClick={async () => {
              if (status !== 'authenticated') {
                navigate('/login', { replace: true })
                return
              }
              try {
                await addToCart({
                  productoId: product.productoId,
                  nombre: product.nombre,
                  precio: product.precio,
                  stockDisponible: product.cantidad,
                })
                toast.success('Producto agregado al carrito')
              } catch (error) {
                toast.error(getApiErrorMessage(error, 'No se pudo agregar el producto al carrito'))
              }
            }}
          >
            <span className="inline-flex items-center gap-2">
              {isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
              {isOutOfStock ? null : <ShoppingCart className="h-4 w-4" />}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function StoreHomePage() {
  const status = useAuthStore((s) => s.status)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [categoryFilter, setCategoryFilter] = useState<number[]>([])
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'stock' | 'nombre' | undefined>(undefined)
  const [sortOpen, setSortOpen] = useState(false)
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const categoryPickerRef = useRef<HTMLDivElement | null>(null)
  const sortRef = useRef<HTMLDivElement | null>(null)

  const productsQuery = useQuery({
    queryKey: ['store-products'],
    queryFn: () => listProducts({ page: 1, limit: 24 }),
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories({ page: 1, limit: 100 }),
    staleTime: 60_000,
  })

  // Handle outside click to close dropdowns
  useEffect(() => {
    if (!categoryFilterOpen && !sortOpen) return

    function onPointerDown(e: PointerEvent) {
      const catEl = categoryPickerRef.current
      const sEl = sortRef.current
      if (e.target instanceof Node) {
        if (categoryFilterOpen && catEl && !catEl.contains(e.target)) setCategoryFilterOpen(false)
        if (sortOpen && sEl && !sEl.contains(e.target)) setSortOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [categoryFilterOpen, sortOpen])

  // Cargar los items del carrito cuando la página se monta o cuando el usuario se autentica
  useEffect(() => {
    if (status === 'authenticated') {
      getMyCart()
        .then((cart) => {
          // Actualizar el store local con los items del servidor
          if (cart.items && Array.isArray(cart.items)) {
            const items: Record<number, any> = {}
            cart.items.forEach((item) => {
              items[item.productoId] = {
                producto: {
                  productoId: item.productoId,
                  nombre: item.productoNombre,
                  precio: item.precioUnitario,
                },
                quantity: item.cantidad,
              }
            })
            useCartStore.setState({ items })
          }
        })
        .catch(() => {
          // Si hay error, el carrito sigue vacío
        })
    }
  }, [status])

  const products = productsQuery.data?.data ?? []

  const sortedProducts = useMemo(() => {
    let result = [...products]

    // Aplicar filtro de categoría
    if (categoryFilter.length > 0) {
      // Para filtrar por categoría, necesitaríamos un mapa de productos a categorías
      // Por ahora, mostrar todos (el backend debería hacer este filtro)
      // TODO: Implementar mapa de producto a categorías
    }

    // Aplicar búsqueda
    if (debouncedSearch.trim() !== '') {
      result = result.filter((p) =>
        p.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(debouncedSearch.toLowerCase()))
      )
    }

    // Aplicar ordenamiento
    result.sort((a, b) => {
      let compareResult = 0

      if (sortBy === 'stock') {
        compareResult = a.cantidad - b.cantidad
      } else if (sortBy === 'nombre') {
        compareResult = a.nombre.localeCompare(b.nombre)
      } else {
        // Por defecto: ordenar por stock status, luego por nombre
        const statusA = getStockStatus(a.cantidad)
        const statusB = getStockStatus(b.cantidad)
        const priority = { available: 0, low: 1, out: 2 }
        compareResult = priority[statusA] - priority[statusB]
        if (compareResult === 0) {
          compareResult = a.nombre.localeCompare(b.nombre)
        }
      }

      return order === 'asc' ? compareResult : -compareResult
    })

    return result
  }, [products, debouncedSearch, categoryFilter, sortBy, order])

  const { data: heroMedia } = useStoreHeroVideo()

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {heroMedia && (
        <div className="w-full">
          <MediaHero media={heroMedia} className="w-full" />
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-slate-950/70 p-6 shadow-[0_20px_80px_rgba(59,130,246,0.08)] sm:p-8">
        <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute left-20 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200 shadow-sm shadow-blue-500/10">
              <Sparkles className="h-3.5 w-3.5" />
              Catálogo recomendado
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Tienda
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                Explora el catálogo, agrega productos al carrito y finaliza tu compra.
              </p>
            </div>
          </div>

          <div className="w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="h-12 w-full rounded-xl border-white/10 bg-white/10 pl-10 text-white placeholder:text-white/50 focus-visible:border-blue-400/50 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="relative z-10 flex items-center gap-3 p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
        <ClearFiltersButton
          onClick={() => {
            setSearchQuery('')
            setCategoryFilter([])
            setSortBy(undefined)
            setOrder('desc')
            setCategoryFilterOpen(false)
            setSortOpen(false)
          }}
          hasActiveFilters={!!debouncedSearch || categoryFilter.length > 0 || !!sortBy}
        />

        {categoriesQuery.data && (
          <div className="relative" ref={categoryPickerRef}>
            <CategoryFilterDropdown
              categories={categoriesQuery.data}
              selectedIds={categoryFilter}
              onSelectionChange={setCategoryFilter}
              isOpen={categoryFilterOpen}
              onOpenChange={setCategoryFilterOpen}
            />
          </div>
        )}

        <div className="relative" ref={sortRef}>
          <SortDropdown
            value={sortBy}
            onChange={setSortBy}
            isOpen={sortOpen}
            onOpenChange={setSortOpen}
          />
        </div>

        <OrderToggleButton order={order} onChange={setOrder} />
      </div>

      {status !== 'authenticated' ? (
        <Card className="border-dashed border-blue-500/20 bg-blue-500/5">
          <CardContent className="flex flex-col gap-4 py-8 text-center">
            <CardTitle className="flex items-center justify-center gap-2">Inicia sesión para comprar</CardTitle>
            <p className="text-muted-foreground">
              Para ver tu carrito y tus pedidos necesitas autenticarte.
            </p>
            <Button asChild className="w-fit mx-auto">
              <a href="/login">Ir a login</a>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-4">
        {productsQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-border/70 bg-card/50 p-4">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="mt-4 h-5 w-2/3 rounded-full" />
                <Skeleton className="mt-2 h-4 w-5/6 rounded-full" />
                <div className="mt-4 flex gap-3">
                  <Skeleton className="h-16 flex-1 rounded-2xl" />
                  <Skeleton className="h-16 flex-1 rounded-2xl" />
                </div>
                <Skeleton className="mt-4 h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {sortedProducts.map((p) => (
              <ProductCard key={p.productoId} product={p} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <CardTitle>No se encontraron productos</CardTitle>
              <p className="text-muted-foreground mt-2">Intenta con otro término de búsqueda.</p>
            </CardContent>
          </Card>
        )}
      </div>
      <FloatingCartButton />
    </div>
  )
}
