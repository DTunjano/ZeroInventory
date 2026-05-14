import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/modules/auth/application/auth.store'
import { addToCart } from '@/modules/cart/application/cart.use-cases'
import { listProducts } from '@/modules/products/application/products.use-cases'
import { listImagesByProduct } from '@/modules/products/application/product-images.use-cases'
import type { Product } from '@/modules/products/domain/product.models'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { useNavigate, Link } from 'react-router-dom'
import { Package, ShoppingCart, Sparkles, Tag } from 'lucide-react'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function ProductCard({ product }: { product: Product }) {
  const status = useAuthStore((s) => s.status)
  const navigate = useNavigate()
  const imageQuery = useQuery({
    queryKey: ['product-images', product.productoId],
    queryFn: () => listImagesByProduct(product.productoId),
  })

  const imageUrl = imageQuery.data?.data?.[0]?.url ?? null
  const isOutOfStock = product.cantidad <= 0
  const isLowStock = product.cantidad > 0 && product.cantidad <= 10
  const formattedPrice = formatPrice(product.precio)

  const stockStatus = isOutOfStock 
    ? 'Sin stock' 
    : isLowStock 
      ? 'Pocas unidades disponibles'
      : 'Disponible'

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
          <div className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]',
            isOutOfStock 
              ? 'border-red-500/30 bg-red-500/10 text-red-400' 
              : isLowStock
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                : 'border-green-500/30 bg-green-500/10 text-green-400'
          )}>
            <Tag className="h-3.5 w-3.5" />
            {stockStatus}
          </div>

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

  const productsQuery = useQuery({
    queryKey: ['store-products'],
    queryFn: () => listProducts({ page: 1, limit: 24 }),
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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
                Explora el catálogo, agrega productos al carrito y finaliza tu compra en la misma sesión.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75 backdrop-blur-sm">
              Descubre lo que necesitas, al instante.
            </div>
            <Button asChild variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-100 hover:border-blue-400 hover:bg-blue-500/15 hover:text-white">
              <Link to="/me/cart" className="inline-flex items-center gap-2">
                Ver carrito
                <ShoppingCart className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {status !== 'authenticated' ? (
        <Card className="border-dashed border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Inicia sesión</CardTitle>
            <CardDescription>
              Para ver tu carrito y tus pedidos necesitas autenticarte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/login">Ir a login</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
                <Sparkles className="h-3.5 w-3.5" />
                Explora productos seleccionados
              </div>
              <p className="text-sm text-muted-foreground">
                Navegación ágil, tarjetas limpias y carga optimizada para catálogos grandes.
              </p>
            </div>
          </div>

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
          ) : productsQuery.isError ? (
            <Card>
              <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>
                  {getApiErrorMessage(productsQuery.error, 'Error al cargar productos')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => {
                    void productsQuery.refetch().then((r) => {
                      if (r.isError) toast.error('Error al cargar productos')
                    })
                  }}
                >
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          ) : productsQuery.data?.data?.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {productsQuery.data.data.map((p) => (
                <ProductCard key={p.productoId} product={p} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Sin productos</CardTitle>
                <CardDescription>No hay productos disponibles.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
