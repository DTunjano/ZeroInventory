import { toast } from 'sonner'

import { useCartStore } from '@/modules/cart/application/cart.store'
import { clearCart, removeFromCart } from '@/modules/cart/application/cart.use-cases'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function MyCartPage() {
  const items = useCartStore((s) => Object.values(s.items))
  const total = items.reduce((acc, it) => acc + it.producto.precio * it.quantity, 0)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mi carrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vista local (frontend) — listo para integrar `GET /carritos/me`.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carrito</CardTitle>
          <CardDescription>Items + total</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">Tu carrito está vacío.</div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <div
                  key={it.producto.productoId}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-card/50 p-4"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{it.producto.nombre}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {it.quantity} × {formatPrice(it.producto.precio)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold">{formatPrice(it.producto.precio * it.quantity)}</div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        removeFromCart(it.producto.productoId)
                        toast.success('Producto removido del carrito')
                      }}
                    >
                      Quitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-lg font-semibold">{formatPrice(total)}</div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              disabled={items.length === 0}
              onClick={() => {
                clearCart()
                toast.success('Carrito limpiado')
              }}
            >
              Vaciar carrito
            </Button>
            <Button disabled={items.length === 0} onClick={() => toast.message('Checkout: pendiente de integración')}>
              Ir a checkout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
