import { useAuthStore } from '@/modules/auth/application/auth.store'
import { useCartStore } from '@/modules/cart/application/cart.store'
import { ShoppingCart } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function FloatingCartButton() {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const itemCount = useCartStore((s) =>
    Object.values(s.items).filter((it) => it && it.quantity > 0).length,
  )
  const location = useLocation()

  const isCustomer =
    status === 'authenticated' &&
    (user?.roles ?? []).some((role) => role.toUpperCase() === 'CUSTOMER')

  const isStoreRoute = location.pathname === '/tienda' || location.pathname.startsWith('/tienda/')

  if (!isCustomer || itemCount === 0 || !isStoreRoute || location.pathname.startsWith('/me/cart')) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 floating-cart-levitate">
      <Link
        to="/me/cart"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-110 hover:bg-blue-500 animate-in fade-in slide-in-from-bottom-4"
        aria-label="Ver carrito"
      >
        <ShoppingCart className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold ring-2 ring-white">
          {itemCount}
        </span>
      </Link>
    </div>
  )
}
