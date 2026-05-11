import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuthStore } from '@/modules/auth/application/auth.store'
import { addToCart } from '@/modules/cart/application/cart.use-cases'
import { listProducts } from '@/modules/products/application/products.use-cases'
import { listImagesByProduct } from '@/modules/products/application/product-images.use-cases'
import type { Product } from '@/modules/products/domain/product.models'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function ProductCard({ product }: { product: Product }) {
  const imageQuery = useQuery({
    queryKey: ['product-images', product.productoId],
    queryFn: () => listImagesByProduct(product.productoId),
  })

  const imageUrl = imageQuery.data?.data?.[0]?.url ?? null
  const isOutOfStock = product.cantidad <= 0

  return (
    <div className="group rounded-xl border bg-card/50 p-4 transition-colors hover:bg-card">
      <div className="aspect-square w-full overflow-hidden rounded-lg border bg-muted/30">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.nombre}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            {imageQuery.isLoading ? 'Cargando…' : 'Sin imagen'}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="line-clamp-2 text-sm font-medium">{product.nombre}</div>
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-base font-semibold text-foreground">
            {formatPrice(product.precio)}
          </div>
          <div className="text-xs text-muted-foreground">Stock: {product.cantidad}</div>
        </div>

        <Button
          className="w-full"
          disabled={isOutOfStock}
          onClick={async () => {
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
          {isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
        </Button>
      </div>
    </div>
  )
}

export function StoreHomePage() {
  const status = useAuthStore((s) => s.status)

  const productsQuery = useQuery({
    queryKey: ['store-products'],
    enabled: status === 'authenticated',
    queryFn: () => listProducts({ page: 1, limit: 24 }),
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Tienda</h1>
        <p className="text-sm text-muted-foreground">
          Explora el catálogo, agrega productos al carrito y finaliza tu compra en la misma sesión.
        </p>
      </div>

      {status !== 'authenticated' ? (
        <Card>
          <CardHeader>
            <CardTitle>Inicia sesión</CardTitle>
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
      ) : null}

      {status === 'authenticated' ? (
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Catálogo</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Explora productos y agrégalos al carrito.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/me/cart">Ver carrito</Link>
            </Button>
          </div>

          {productsQuery.isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-card/50 p-4">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="mt-4 h-4 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                  <Skeleton className="mt-4 h-10 w-full" />
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      ) : null}
    </div>
  )
}
