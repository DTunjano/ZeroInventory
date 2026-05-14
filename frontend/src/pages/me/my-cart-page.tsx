import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Minus, Plus, ShoppingBag, Trash2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { clearCart, checkoutCart, getMyCart, removeFromCart, updateCartItemQuantity } from '@/modules/cart/application/cart.use-cases'
import { cartQueryKey } from '@/modules/cart/infrastructure/cart.api'
import type { OpenCartItemView, OpenCartView } from '@/modules/cart/domain/cart.models'
import { listImagesByProduct } from '@/modules/products/application/product-images.use-cases'
import { createMyDireccion, getMyDirecciones } from '@/modules/direcciones/application/direcciones.use-cases'
import { direccionesQueryKey } from '@/modules/direcciones/infrastructure/direcciones.api'
import type { CreateDireccionInput, DireccionView } from '@/modules/direcciones/domain/direccion.models'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { useVirtualScroll } from '@/shared/hooks/useVirtualScroll'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function useProductImage(productoId: number) {
  return useQuery({
    queryKey: ['cart-item-image', productoId],
    queryFn: () => listImagesByProduct(productoId),
    staleTime: 1000 * 60 * 5,
  })
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
  stockDisponible: number
  disabled: boolean
  onDecrease: () => void
  onIncrease: () => void
  onInputChange: (value: number) => void
}) {
  const { quantity, stockDisponible, disabled, onDecrease, onIncrease, onInputChange } = props
  const [inputValue, setInputValue] = useState(String(quantity))

  useEffect(() => {
    setInputValue(String(quantity))
  }, [quantity])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '')
    const newValue = rawValue === '' ? '' : rawValue
    setInputValue(newValue)

    let numericValue = Number(newValue)
    if (Number.isNaN(numericValue) || numericValue < 1) {
      numericValue = 1
    }

    setInputValue(String(numericValue))
    onInputChange(numericValue)
  }

  const handleBlur = () => {
    let numericValue = Number(inputValue)
    if (Number.isNaN(numericValue) || numericValue < 1) {
      numericValue = 1
    }

    setInputValue(String(numericValue))
    onInputChange(numericValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  return (
    <div className="inline-flex items-center rounded-md border bg-background">
      <Button
        type="button"
        variant="ghost"
        size="icon"
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
        onKeyDown={handleKeyDown}
        className="h-9 w-14 rounded-none border-0 border-x px-2 text-center text-sm font-medium tabular-nums focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled={disabled}
        aria-label="Cantidad"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
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
  onRemove: () => void
  onQuantityChange: (value: number) => void
  disabled: boolean
}) {
  const { item, onDecrease, onIncrease, onRemove, onQuantityChange, disabled } = props

  const imageQuery = useProductImage(item.productoId)
  const imageUrl = imageQuery.data?.data?.[0]?.url ?? null
  const isOutOfStock = item.cantidad >= item.stockDisponible

  return (
    <Card className="overflow-hidden border bg-card/80 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg border bg-muted/20 sm:h-24 sm:w-24">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.productoNombre}
                className="h-full w-full object-cover"
                loading="lazy"
              />
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
                <p className="text-sm text-muted-foreground">
                  Precio unitario: {formatPrice(item.precioUnitario)}
                </p>
              </div>

            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Cantidad</div>
                <QuantitySelector
                  quantity={item.cantidad}
                  stockDisponible={item.stockDisponible}
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
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={disabled}
                onClick={onRemove}
              >
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
  impuestos: number
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
  const {
    subtotal,
    impuestos,
    total,
    direcciones,
    direccionId,
    metodoPago,
    isAddressesLoading,
    isCreatingAddress,
    isBusy,
    showNewAddressForm,
    newDireccion,
    onDireccionIdChange,
    onMetodoPagoChange,
    onToggleNewAddressForm,
    onNewDireccionChange,
    onCreateAddress,
    onCheckout,
    onClearCart,
  } = props

  return (
    <Card className="border bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle>Resumen de compra</CardTitle>
        <CardDescription>Revisa tu pedido antes de confirmarlo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3 rounded-lg border bg-background p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Impuestos</span>
            <span className="font-medium">{formatPrice(impuestos)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Dirección de entrega</div>
              <p className="text-xs text-muted-foreground">
                Elige una dirección guardada o crea una nueva antes de pagar.
              </p>
            </div>
            <Button variant="ghost" size="sm" type="button" onClick={onToggleNewAddressForm}>
              {showNewAddressForm ? 'Ocultar' : 'Agregar nueva'}
            </Button>
          </div>

          {isAddressesLoading ? (
            <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              Cargando direcciones…
            </div>
          ) : direcciones.length ? (
            <Select
              id="direccionId"
              value={direccionId}
              onChange={(event) => onDireccionIdChange(event.target.value)}
            >
              <option value="">Selecciona una dirección</option>
              {direcciones.map((direccion) => (
                <option key={direccion.direccionId} value={direccion.direccionId}>
                  {direccion.lineaDir} - {direccion.barrio}
                </option>
              ))}
            </Select>
          ) : (
            <div className="rounded-md border border-dashed border-destructive/30 bg-destructive/5 px-3 py-3 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">No tienes direcciones guardadas todavía.</p>
                <p className="text-xs">Debes agregar una dirección para poder confirmar tu compra.</p>
              </div>
            </div>
          )}

          {showNewAddressForm ? (
            <div className="grid gap-3 rounded-md border bg-card p-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="lineaDir">
                  Línea de dirección
                </label>
                <Input
                  id="lineaDir"
                  placeholder="Calle 10 No. 20-30"
                  value={newDireccion.lineaDir}
                  onChange={(event) => onNewDireccionChange('lineaDir', event.target.value)}
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="barrio">
                    Barrio
                  </label>
                  <Input
                    id="barrio"
                    placeholder="Centro"
                    value={newDireccion.barrio}
                    onChange={(event) => onNewDireccionChange('barrio', event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="codigoPostal">
                    Código postal
                  </label>
                  <Input
                    id="codigoPostal"
                    placeholder="080001"
                    value={newDireccion.codigoPostal ?? ''}
                    onChange={(event) => onNewDireccionChange('codigoPostal', event.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="infoAdiccional">
                  Información adicional
                </label>
                <Input
                  id="infoAdiccional"
                  placeholder="Apartamento 305, torre B"
                  value={newDireccion.infoAdiccional ?? ''}
                  onChange={(event) => onNewDireccionChange('infoAdiccional', event.target.value)}
                />
              </div>
              <Button type="button" variant="outline" disabled={isCreatingAddress} onClick={onCreateAddress}>
                {isCreatingAddress ? 'Guardando…' : 'Guardar dirección'}
              </Button>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="metodoPago">
            Método de pago
          </label>
          <Select
            id="metodoPago"
            value={metodoPago}
            onChange={(event) => onMetodoPagoChange(event.target.value as 'EFECTIVO' | 'TRANSFERENCIA')}
          >
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="EFECTIVO">Contra entrega</option>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Button className="w-full" disabled={isBusy || !direccionId.trim()} onClick={onCheckout}>
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
                if (item.cantidad <= 1) {
                  onRemove(item.carritoDetalleId)
                  return
                }
                onUpdateQuantity(item.carritoDetalleId, item.cantidad - 1)
              }}
              onIncrease={() => {
                onUpdateQuantity(item.carritoDetalleId, item.cantidad + 1)
              }}
              onQuantityChange={(value) => {
                onUpdateQuantity(item.carritoDetalleId, value)
              }}
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
  const [searchQuery, setSearchQuery] = useState('')
  const [direccionId, setDireccionId] = useState('')
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TRANSFERENCIA'>('TRANSFERENCIA')
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [newDireccion, setNewDireccion] = useState<CreateDireccionInput>({
    lineaDir: '',
    barrio: '',
    codigoPostal: '',
    infoAdiccional: '',
  })

  const cartQuery = useQuery({
    queryKey: cartQueryKey,
    queryFn: getMyCart,
  })

  const direccionesQuery = useQuery({
    queryKey: direccionesQueryKey,
    queryFn: getMyDirecciones,
  })

  const allItems = useMemo(() => {
    const rawItems = cartQuery.data?.items ?? []
    return [...rawItems].sort((a, b) => a.carritoDetalleId - b.carritoDetalleId)
  }, [cartQuery.data?.items])

  const items = useMemo(() => {
    if (!searchQuery.trim()) return allItems
    const query = searchQuery.toLowerCase().trim()
    return allItems.filter(item => 
      item.productoNombre.toLowerCase().includes(query)
    )
  }, [allItems, searchQuery])

  const subtotal = cartQuery.data?.total ?? 0
  const impuestos = 0
  const total = subtotal + impuestos

  useEffect(() => {
    const firstAddress = direccionesQuery.data?.[0]
    if (!direccionId && firstAddress) {
      setDireccionId(String(firstAddress.direccionId))
    }
  }, [direccionId, direccionesQuery.data])

  const refreshCart = useCallback(
    (next: Awaited<ReturnType<typeof getMyCart>>) => {
      queryClient.setQueryData(cartQueryKey, next)
    },
    [queryClient],
  )

  const refreshDirecciones = useCallback(
    (next: Awaited<ReturnType<typeof getMyDirecciones>>) => {
      queryClient.setQueryData(direccionesQueryKey, next)
    },
    [queryClient],
  )

  const updateQuantityMutation = useMutation({
    mutationFn: ({ carritoDetalleId, cantidad }: { carritoDetalleId: number; cantidad: number }) =>
      updateCartItemQuantity(carritoDetalleId, cantidad),
    onSuccess: (data) => {
      refreshCart(data)
      toast.success('Cantidad actualizada')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar la cantidad'))
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: (carritoDetalleId: number) => removeFromCart(carritoDetalleId),
    onSuccess: (data) => {
      refreshCart(data)
      toast.success('Producto eliminado del carrito')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo eliminar el producto'))
    },
  })

  const clearCartMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: (data) => {
      refreshCart(data)
      toast.success('Carrito vaciado')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo vaciar el carrito'))
    },
  })

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      // Validar stock antes de proceder
      const stockErrors: string[] = []
      for (const item of allItems) {
        if (item.cantidad > item.stockDisponible) {
          stockErrors.push(`${item.productoNombre}: necesitas ${item.cantidad} pero solo hay ${item.stockDisponible} disponibles`)
        }
      }
      
      if (stockErrors.length > 0) {
        const message = stockErrors.length === 1 
          ? `⚠️ ${stockErrors[0]}`
          : `⚠️ Stock insuficiente:\n${stockErrors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`
        toast.error(message, { duration: 5000 })
        throw new Error('Stock insuficiente')
      }

      const parsedDireccionId = Number(direccionId)
      return checkoutCart({
        direccionId: parsedDireccionId,
        metodoPago,
      })
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: cartQueryKey })
      toast.success(`✅ Compra confirmada. Pedido #${result.pedidoId} por ${formatPrice(result.total)}`)
    },
    onError: (error) => {
      if ((error as Error).message === 'Stock insuficiente') return
      toast.error(getApiErrorMessage(error, 'No se pudo confirmar la compra'))
    },
  })

  const createAddressMutation = useMutation({
    mutationFn: () =>
      createMyDireccion({
        lineaDir: newDireccion.lineaDir.trim(),
        barrio: newDireccion.barrio.trim(),
        codigoPostal: newDireccion.codigoPostal?.trim() || null,
        infoAdiccional: newDireccion.infoAdiccional?.trim() || null,
      }),
    onSuccess: (data) => {
      const next = [...(direccionesQuery.data ?? []), data]
      refreshDirecciones(next)
      setDireccionId(String(data.direccionId))
      setShowNewAddressForm(false)
      setNewDireccion({ lineaDir: '', barrio: '', codigoPostal: '', infoAdiccional: '' })
      toast.success('Dirección guardada')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar la dirección'))
    },
  })

  const isBusy =
    cartQuery.isLoading ||
    direccionesQuery.isLoading ||
    updateQuantityMutation.isPending ||
    removeItemMutation.isPending ||
    clearCartMutation.isPending ||
    checkoutMutation.isPending ||
    createAddressMutation.isPending

  const hasItems = items.length > 0

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Mi carrito</h1>
        <p className="text-sm text-muted-foreground">
          Revisa productos, cantidades y confirma la compra sin salir de la vista.
        </p>
      </div>

      {items.length > 0 && (
        <div className="sticky top-0 z-10">
          <Input
            type="text"
            placeholder="🔍 Buscar por nombre de producto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          {searchQuery && items.length === 0 && (
            <div className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700">
              No encontramos productos que coincidan con "{searchQuery}"
            </div>
          )}
        </div>
      )}

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
            <CardDescription>
              {getApiErrorMessage(cartQuery.error, 'Ocurrió un error al cargar tu carrito')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => void cartQuery.refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : !hasItems ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-4">
            {items.length > 10 ? (
              <VirtualCartList
                items={items}
                isBusy={isBusy}
                onUpdateQuantity={(carritoDetalleId, cantidad) =>
                  updateQuantityMutation.mutate({ carritoDetalleId, cantidad })
                }
                onRemove={(carritoDetalleId) => removeItemMutation.mutate(carritoDetalleId)}
              />
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemCard
                    key={item.carritoDetalleId}
                    item={item}
                    disabled={isBusy}
                    onDecrease={() => {
                      if (item.cantidad <= 1) {
                        removeItemMutation.mutate(item.carritoDetalleId)
                        return
                      }
                      updateQuantityMutation.mutate({
                        carritoDetalleId: item.carritoDetalleId,
                        cantidad: item.cantidad - 1,
                      })
                    }}
                    onIncrease={() => {
                      updateQuantityMutation.mutate({
                        carritoDetalleId: item.carritoDetalleId,
                        cantidad: item.cantidad + 1,
                      })
                    }}
                    onQuantityChange={(value) => {
                      updateQuantityMutation.mutate({
                        carritoDetalleId: item.carritoDetalleId,
                        cantidad: value,
                      })
                    }}
                    onRemove={() => removeItemMutation.mutate(item.carritoDetalleId)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <CartSummary
              subtotal={subtotal}
              impuestos={impuestos}
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
              onToggleNewAddressForm={() => setShowNewAddressForm((current) => !current)}
              onNewDireccionChange={(field, value) =>
                setNewDireccion((current) => ({ ...current, [field]: value }))
              }
              onCreateAddress={() => {
                if (!newDireccion.lineaDir.trim() || !newDireccion.barrio.trim()) {
                  toast.error('Completa la línea de dirección y el barrio')
                  return
                }
                createAddressMutation.mutate()
              }}
              onCheckout={() => {
                if (!direccionId.trim()) {
                  toast.error('Debes seleccionar una dirección')
                  return
                }
                checkoutMutation.mutate()
              }}
              onAddDireccion={() => navigate('/me/direcciones')}
              onClearCart={() => clearCartMutation.mutate()}
            />
          </div>
        </div>
      )}

      {cartQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : null}
    </div>
  )
}
