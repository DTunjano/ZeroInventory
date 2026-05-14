import { useAuthStore } from '@/modules/auth/application/auth.store'
import { useCartStore } from '@/modules/cart/application/cart.store'
import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'

export function FloatingCartButton() {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const roles = (user?.roles ?? []).map((r) => r.toUpperCase())
  const isCustomer = status === 'authenticated' && roles.includes('CUSTOMER')
  const items = useCartStore((s) => s.items)
  const itemCount = Object.keys(items).length

  if (!isCustomer || itemCount === 0) {
    return null
  }

  return (
    <Link
      to="/me/cart"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-110 hover:bg-blue-500 animate-in fade-in slide-in-from-bottom-4"
      aria-label="Ver carrito"
    >
      <ShoppingCart className="h-6 w-6" />
      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold ring-2 ring-white">
        {itemCount}
      </span>
    </Link>
  )
}
