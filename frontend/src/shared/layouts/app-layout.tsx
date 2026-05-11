import { Link, NavLink, Outlet } from 'react-router-dom'
import { Bell, Briefcase, LayoutGrid, Package, ShoppingCart, Users } from 'lucide-react'
import type { ComponentType } from 'react'

import { useAuthStore } from '@/modules/auth/application/auth.store'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'

export type AppLayoutNavItem = {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
}

type RoleKey = 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER'

const navByRole: Record<RoleKey, AppLayoutNavItem[]> = {
  ADMIN: [
    { to: '/admin', label: 'Dashboard', icon: LayoutGrid },
    { to: '/admin/products', label: 'Productos', icon: Package },
    { to: '/admin/users', label: 'Usuarios', icon: Users },
    { to: '/admin/employees', label: 'Empleados', icon: Briefcase },
  ],
  EMPLOYEE: [
    { to: '/employee', label: 'Dashboard', icon: LayoutGrid },
    { to: '/employee/products', label: 'Productos', icon: Package },
  ],
  CUSTOMER: [
    { to: '/', label: 'Tienda', icon: LayoutGrid },
    { to: '/me/cart', label: 'Carrito', icon: ShoppingCart },
    { to: '/me/orders', label: 'Mis pedidos', icon: Package },
  ],
}

function pickNav(roles: string[]): AppLayoutNavItem[] {
  if (roles.includes('ADMIN')) return navByRole.ADMIN
  if (roles.includes('EMPLOYEE')) return navByRole.EMPLOYEE
  return navByRole.CUSTOMER
}

export function AppLayout(props: { title?: string }) {
  const { title } = props
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const roles = (user?.roles ?? []).map((r) => r.toUpperCase())
  const nav = pickNav(roles)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="grid min-h-dvh grid-cols-[16rem_1fr]">
        <aside className="hidden border-r bg-card md:block">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <Link to="/" className="font-semibold tracking-tight">
              Zero Inventory
            </Link>
          </div>

          <nav className="p-2">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-foreground'
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto border-t p-3">
            <div className="text-xs text-muted-foreground">Sesión</div>
            <div className="mt-1 truncate text-sm font-medium">
              {status === 'authenticated' ? user?.username : '—'}
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
            <div className="min-w-0 flex-1">
              <Input
                placeholder="Buscar…"
                className="h-9 max-w-xl"
                aria-label="Buscar"
              />
            </div>

            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Notificaciones">
              <Bell className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9">
                  {user?.username ?? 'Cuenta'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {status === 'authenticated' ? user?.username : 'Invitado'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/">Ir a inicio</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    void logout()
                  }}
                >
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6">
            {title ? (
              <div className="mb-6 flex items-center justify-between gap-4">
                <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              </div>
            ) : null}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
