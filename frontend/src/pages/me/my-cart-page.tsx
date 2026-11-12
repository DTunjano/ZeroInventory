import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Minus, Plus, ShoppingBag, Trash2, ArrowLeft, Search, CreditCard, MapPin, AlertTriangle, PackageX, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

import { clearCart, checkoutCart, getMyCart, removeFromCart, updateCartItemQuantity } from '@/modules/cart/application/cart.use-cases'
import { cartQueryKey } from '@/modules/cart/infrastructure/cart.api'
import type { CheckoutStockInsufficientResponse, OpenCartItemView } from '@/modules/cart/domain/cart.models'
import { listImagesByProduct } from '@/modules/products/application/product-images.use-cases'
import { createMyDireccion, getMyDirecciones } from '@/modules/direcciones/application/direcciones.use-cases'
import { direccionesQueryKey } from '@/modules/direcciones/infrastructure/direcciones.api'
import type { CreateDireccionInput, DireccionView } from '@/modules/direcciones/domain/direccion.models'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { useVirtualScroll } from '@/shared/hooks/useVirtualScroll'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Tu carrito está vacío</h2>
          <p className="text-sm text-muted-foreground">
            Agrega productos desde la tienda para comenzar tu compra.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function QuantitySelector(props: {
  quantity: number
  disabled: boolean
  onDecrease: () => void
  onIncrease: () => void
  onInputChange: (value: number) => void
}) {
  const { quantity, disabled, onDecrease, onIncrease, onInputChange } = props
  const [inputValue, setInputValue] = useState(String(quantity))

  useEffect(() => {
    setInputValue(String(quantity))
  }, [quantity])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, '')
    if (raw.startsWith('0')) raw = raw.replace(/^0+/, '') || '0'
    setInputValue(raw)
  }

  const handleBlur = () => {
    let num = Number(inputValue)
    if (!inputValue || Number.isNaN(num) || num < 1) num = 1
    setInputValue(String(num))
    onInputChange(num)
  }

  return (
    <div className="inline-flex items-center rounded-md border bg-background">
      <Button
        type="button" variant="ghost" size="icon"
        className="h-9 w-9 rounded-none rounded-l-md"
        disabled={disabled || quantity <= 1}
        onClick={onDecrease}
        aria-label="Disminuir cantidad"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
        className="h-9 w-14 rounded-none border-0 border-x px-2 text-center text-sm font-medium tabular-nums focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled={disabled}
        aria-label="Cantidad"
      />
      <Button
        type="button" variant="ghost" size="icon"
        className="h-9 w-9 rounded-none rounded-r-md"
        disabled={disabled}
        onClick={onIncrease}
        aria-label="Aumentar cantidad"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

function CartItemCard(props: {
  item: OpenCartItemView
  onDecrease: () => void
  onIncrease: () => void
  onQuantityChange: (value: number) => void
  onRemove: () => void
  disabled: boolean
}) {
  const { item, onDecrease, onIncrease, onRemove, onQuantityChange, disabled } = props

  const imageQuery = useQuery({
    queryKey: ['cart-item-image', item.productoId],
    queryFn: () => listImagesByProduct(item.productoId),
    staleTime: 1000 * 60 * 5,
  })
  const imageUrl = imageQuery.data?.data?.[0]?.url ?? null

  return (
    <Card className="overflow-hidden border bg-card/80 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg border bg-muted/20 sm:h-24 sm:w-24">
            {imageUrl ? (
              <img src={imageUrl} alt={item.productoNombre} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                {imageQuery.isLoading ? 'Cargando…' : 'Sin imagen'}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <h3 className="truncate text-base font-semibold">{item.productoNombre}</h3>
                <p className="text-sm text-muted-foreground">Precio: {formatPrice(item.precioUnitario)}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Cantidad</div>
                <QuantitySelector
                  quantity={item.cantidad}
                  disabled={disabled}
                  onDecrease={onDecrease}
                  onIncrease={onIncrease}
                  onInputChange={onQuantityChange}
                />
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <div className="text-sm text-muted-foreground">Subtotal</div>
                <div className="text-lg font-semibold">{formatPrice(item.subtotal)}</div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" disabled={disabled} onClick={onRemove}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CartSummary(props: {
  subtotal: number
  total: number
  direcciones: DireccionView[]
  direccionId: string
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA'
  isAddressesLoading: boolean
  isCreatingAddress: boolean
  isBusy?: boolean
  showNewAddressForm: boolean
  newDireccion: CreateDireccionInput
  onDireccionIdChange: (value: string) => void
  onMetodoPagoChange: (value: 'EFECTIVO' | 'TRANSFERENCIA') => void
  onToggleNewAddressForm: () => void
  onNewDireccionChange: (field: keyof CreateDireccionInput, value: string) => void
  onCreateAddress: () => void
  onCheckout: () => void
  onClearCart: () => void
}) {
  const { subtotal, total, direcciones, direccionId, metodoPago, isAddressesLoading, isCreatingAddress, isBusy, showNewAddressForm, newDireccion, onDireccionIdChange, onMetodoPagoChange, onToggleNewAddressForm, onNewDireccionChange, onCreateAddress, onCheckout, onClearCart } = props

  return (
    <Card className="border bg-card/80 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Resumen de compra</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3 rounded-lg border bg-background p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Dirección de entrega</div>
            </div>
            <Button variant="ghost" size="sm" onClick={onToggleNewAddressForm}>
              {showNewAddressForm ? 'Ocultar' : 'Agregar nueva'}
            </Button>
          </div>

          {isAddressesLoading ? (
            <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">Cargando direcciones…</div>
          ) : direcciones.length ? (
            <Select id="direccionId" value={direccionId} onChange={(e) => onDireccionIdChange(e.target.value)}>
              <option value="">Selecciona una dirección</option>
              {direcciones.map((d) => (
                <option key={d.direccionId} value={d.direccionId}>{d.lineaDir} - {d.barrio}</option>
              ))}
            </Select>
          ) : (
            <div className="rounded-md border border-dashed border-destructive/30 bg-destructive/5 px-3 py-3 text-sm text-destructive flex items-center gap-2">
              <span>No tienes direcciones guardadas todavía. Debes agregar una para poder confirmar tu compra.</span>
            </div>
          )}

          {showNewAddressForm ? (
            <div className="grid gap-3 rounded-md border bg-card p-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Línea de dirección</label>
                <Input placeholder="Calle 10 No. 20-30" value={newDireccion.lineaDir} onChange={(e) => onNewDireccionChange('lineaDir', e.target.value)} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Barrio</label>
                  <Input placeholder="Centro" value={newDireccion.barrio} onChange={(e) => onNewDireccionChange('barrio', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Código postal</label>
                  <Input placeholder="080001" value={newDireccion.codigoPostal ?? ''} onChange={(e) => onNewDireccionChange('codigoPostal', e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Información adicional</label>
                <Input placeholder="Apartamento 305, torre B" value={newDireccion.infoAdiccional ?? ''} onChange={(e) => onNewDireccionChange('infoAdiccional', e.target.value)} />
              </div>
              <Button variant="outline" disabled={isCreatingAddress} onClick={onCreateAddress}>
                {isCreatingAddress ? 'Guardando…' : 'Guardar dirección'}
              </Button>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="metodoPago">Método de pago</label>
          <Select id="metodoPago" value={metodoPago} onChange={(e) => onMetodoPagoChange(e.target.value as 'EFECTIVO' | 'TRANSFERENCIA')}>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="EFECTIVO">Contra entrega</option>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Button className="w-full" disabled={isBusy || !direccionId.trim()} onClick={onCheckout}>
            <CreditCard className="mr-2 h-4 w-4" />
            {isBusy ? 'Procesando…' : 'Confirmar compra'}
          </Button>
          <Button variant="outline" className="w-full" disabled={isBusy} onClick={onClearCart}>
            Vaciar carrito
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function VirtualCartList(props: {
  items: OpenCartItemView[]
  isBusy: boolean
  onUpdateQuantity: (carritoDetalleId: number, cantidad: number) => void
  onRemove: (carritoDetalleId: number) => void
}) {
  const { items, isBusy, onUpdateQuantity, onRemove } = props

  const { containerRef, virtualItems, totalHeight } = useVirtualScroll(items, {
    itemHeight: 220,
    overscan: 3,
  })

  return (
    <div ref={containerRef} className="relative h-[500px] overflow-auto rounded-lg">
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map(({ item, style }) => (
          <div key={item.carritoDetalleId} style={style} className="px-1 py-1">
            <CartItemCard
              item={item}
              disabled={isBusy}
              onDecrease={() => {
                if (item.cantidad <= 1) { onRemove(item.carritoDetalleId); return }
                onUpdateQuantity(item.carritoDetalleId, item.cantidad - 1)
              }}
              onIncrease={() => onUpdateQuantity(item.carritoDetalleId, item.cantidad + 1)}
              onQuantityChange={(value) => onUpdateQuantity(item.carritoDetalleId, value)}
              onRemove={() => onRemove(item.carritoDetalleId)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function MyCartPage() {
  const queryClient = useQueryClient()
  const [searchText, setSearchText] = useState('')
  const [checkoutStockIssue, setCheckoutStockIssue] = useState<CheckoutStockInsufficientResponse | null>(null)
  const stockErrorRef = useRef<HTMLDivElement | null>(null)
  const [direccionId, setDireccionId] = useState('')
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TRANSFERENCIA'>('TRANSFERENCIA')
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [newDireccion, setNewDireccion] = useState<CreateDireccionInput>({ lineaDir: '', barrio: '', codigoPostal: '', infoAdiccional: '' })

  const cartQuery = useQuery({
    queryKey: cartQueryKey,
    queryFn: getMyCart,
  })

  const direccionesQuery = useQuery({
    queryKey: direccionesQueryKey,
    queryFn: getMyDirecciones,
  })

  const rawItems = useMemo(() => cartQuery.data?.items ?? [], [cartQuery.data?.items])

  const items = useMemo(() => {
    const sorted = [...rawItems].sort((a, b) => a.carritoDetalleId - b.carritoDetalleId)
    if (!searchText.trim()) return sorted
    return sorted.filter((item) => item.productoNombre.toLowerCase().includes(searchText.toLowerCase()))
  }, [rawItems, searchText])

  const subtotal = cartQuery.data?.total ?? 0
  const total = subtotal

  useEffect(() => {
    const first = direccionesQuery.data?.[0]
    if (!direccionId && first) setDireccionId(String(first.direccionId))
  }, [direccionesQuery.data, direccionId])

  const refreshCart = useCallback((next: Awaited<ReturnType<typeof getMyCart>>) => {
    queryClient.setQueryData(cartQueryKey, next)
  }, [queryClient])

  const updateQuantityMutation = useMutation({
    mutationFn: ({ carritoDetalleId, cantidad }: { carritoDetalleId: number; cantidad: number }) => updateCartItemQuantity(carritoDetalleId, cantidad),
    onSuccess: (data) => { refreshCart(data); setCheckoutStockIssue(null); toast.success('Cantidad actualizada') },
    onError: (error) => { toast.error(getApiErrorMessage(error, 'No se pudo actualizar la cantidad')) },
  })

  const removeItemMutation = useMutation({
    mutationFn: (carritoDetalleId: number) => removeFromCart(carritoDetalleId),
    onSuccess: (data) => { refreshCart(data); setCheckoutStockIssue(null); toast.success('Producto eliminado del carrito') },
    onError: (error) => { toast.error(getApiErrorMessage(error, 'No se pudo eliminar el producto')) },
  })

  const clearCartMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: (data) => { refreshCart(data); setCheckoutStockIssue(null); toast.success('Carrito vaciado') },
    onError: (error) => { toast.error(getApiErrorMessage(error, 'No se pudo vaciar el carrito')) },
  })

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const parsedDireccionId = Number(direccionId)
      return checkoutCart({ direccionId: parsedDireccionId, metodoPago })
    },
    onSuccess: async (result) => {
      if ('error' in result) {
        setCheckoutStockIssue(result)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        toast.error('No se pudo completar tu compra')
        return
      }

      setCheckoutStockIssue(null)
      const nextCart = await getMyCart()
      refreshCart(nextCart)
      await queryClient.invalidateQueries({ queryKey: cartQueryKey })
      toast.success(`Compra confirmada. Pedido #${result.numeroPedidoUsuario} por ${formatPrice(result.total)}`)
    },
    onError: () => {
      setCheckoutStockIssue(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      toast.error('No se pudo completar tu compra')
    },
  })

  const createAddressMutation = useMutation({
    mutationFn: () => createMyDireccion({
      lineaDir: newDireccion.lineaDir.trim(),
      barrio: newDireccion.barrio.trim(),
      codigoPostal: newDireccion.codigoPostal?.trim() || null,
      infoAdiccional: newDireccion.infoAdiccional?.trim() || null,
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(direccionesQueryKey, [...(direccionesQuery.data ?? []), data])
      setDireccionId(String(data.direccionId))
      setShowNewAddressForm(false)
      setNewDireccion({ lineaDir: '', barrio: '', codigoPostal: '', infoAdiccional: '' })
      toast.success('Dirección guardada')
    },
    onError: (err) => { toast.error(getApiErrorMessage(err, 'No se pudo guardar la dirección')) },
  })

  const isBusy = cartQuery.isLoading || direccionesQuery.isLoading || updateQuantityMutation.isPending || removeItemMutation.isPending || clearCartMutation.isPending || checkoutMutation.isPending || createAddressMutation.isPending
  const hasItems = items.length > 0

  useEffect(() => {
    if (checkoutStockIssue && stockErrorRef.current) {
      setTimeout(() => {
        stockErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        window.scrollBy(0, -80)
      }, 100)
    }
  }, [checkoutStockIssue])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Sticky header con búsqueda */}
      <div className="sticky top-0 z-10 -mx-4 bg-[#0f172a]/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-[#0f172a]/80">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Mi carrito</h1>
          <div className="flex items-center gap-3">
            <div className="relative w-48 sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar en carrito..."
                className="h-9 w-full rounded-lg border-white/10 bg-white/10 pl-9 text-sm text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button asChild variant="outline" size="sm" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link to="/tienda" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Seguir comprando</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {checkoutStockIssue ? (
        <Card ref={stockErrorRef} className="overflow-hidden border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-background to-background shadow-[0_18px_60px_rgba(245,158,11,0.12)]">
          <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                  <PackageX className="h-3.5 w-3.5" />
                  Revisión requerida
                </div>
                <h2 className="mt-3 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  No pudimos completar tu compra
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
                  Revisa los productos indicados abajo, ajusta las cantidades y vuelve a intentar sin perder lo que ya agregaste al carrito.
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-amber-500/15 bg-background/80 p-4">
              {checkoutStockIssue.productos.map((producto) => (
                <div key={producto.nombre} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/70 px-4 py-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/70 text-muted-foreground">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-foreground">{producto.nombre}</div>
                    <div className="text-sm text-muted-foreground">
                      Ajusta la cantidad de este producto antes de continuar.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {cartQuery.isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Cargando carrito…
          </CardContent>
        </Card>
      ) : cartQuery.isError ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">No se pudo cargar el carrito</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => void cartQuery.refetch()}>Reintentar</Button>
          </CardContent>
        </Card>
      ) : !hasItems ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          {/* Lista de productos */}
          <div className="space-y-4">
            {items.length > 10 ? (
              <VirtualCartList
                items={items}
                isBusy={isBusy}
                onUpdateQuantity={(id, cantidad) => updateQuantityMutation.mutate({ carritoDetalleId: id, cantidad })}
                onRemove={(id) => removeItemMutation.mutate(id)}
              />
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemCard
                    key={item.carritoDetalleId}
                    item={item}
                    disabled={isBusy}
                    onDecrease={() => { if (item.cantidad <= 1) { removeItemMutation.mutate(item.carritoDetalleId); return } updateQuantityMutation.mutate({ carritoDetalleId: item.carritoDetalleId, cantidad: item.cantidad - 1 }) }}
                    onIncrease={() => updateQuantityMutation.mutate({ carritoDetalleId: item.carritoDetalleId, cantidad: item.cantidad + 1 })}
                    onQuantityChange={(value) => updateQuantityMutation.mutate({ carritoDetalleId: item.carritoDetalleId, cantidad: value })}
                    onRemove={() => removeItemMutation.mutate(item.carritoDetalleId)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Resumen sticky */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <CartSummary
              subtotal={subtotal}
              total={total}
              direcciones={direccionesQuery.data ?? []}
              direccionId={direccionId}
              metodoPago={metodoPago}
              isAddressesLoading={direccionesQuery.isLoading}
              isCreatingAddress={createAddressMutation.isPending}
              isBusy={isBusy}
              showNewAddressForm={showNewAddressForm}
              newDireccion={newDireccion}
              onDireccionIdChange={setDireccionId}
              onMetodoPagoChange={setMetodoPago}
              onToggleNewAddressForm={() => setShowNewAddressForm((c) => !c)}
              onNewDireccionChange={(field, value) => setNewDireccion((prev) => ({ ...prev, [field]: value }))}
              onCreateAddress={() => {
                if (!newDireccion.lineaDir.trim() || !newDireccion.barrio.trim()) { toast.error('Completa la línea de dirección y el barrio'); return }
                createAddressMutation.mutate()
              }}
              onCheckout={() => {
                if (!direccionId.trim()) { toast.error('Debes seleccionar una dirección'); return }
                checkoutMutation.mutate()
              }}
              onClearCart={() => clearCartMutation.mutate()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
