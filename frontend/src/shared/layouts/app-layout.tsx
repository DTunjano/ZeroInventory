import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  Briefcase,
  BarChart3,
  LayoutGrid,
  Package,
  ShoppingCart,
  Archive,
  Settings,
  SlidersHorizontal,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
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
    { to: '/admin/inventory', label: 'Inventario', icon: Archive },
    { to: '/admin/inventory-adjustments', label: 'Ajustes de inventario', icon: SlidersHorizontal },
    { to: '/admin/products', label: 'Productos', icon: Package },
    { to: '/admin/employees', label: 'Empleados', icon: Briefcase },
    { to: '/admin/reports', label: 'Reportes', icon: BarChart3 },
    { to: '/settings', label: 'Configuración', icon: Settings },
  ],
  EMPLOYEE: [
    { to: '/employee', label: 'Dashboard', icon: LayoutGrid },
    { to: '/employee/products', label: 'Productos', icon: Package },
    { to: '/settings', label: 'Configuración', icon: Settings },
  ],
  CUSTOMER: [
    { to: '/', label: 'Tienda', icon: LayoutGrid },
    { to: '/me/cart', label: 'Carrito', icon: ShoppingCart },
    { to: '/me/orders', label: 'Mis pedidos', icon: Package },
    { to: '/settings', label: 'Configuración', icon: Settings },
  ],
}

function pickNav(roles: string[]): AppLayoutNavItem[] {
  if (roles.includes('ADMIN')) return navByRole.ADMIN
  if (roles.includes('EMPLOYEE')) return navByRole.EMPLOYEE
  return navByRole.CUSTOMER
}

export function AppLayout(props: { title?: string }) {
  const { title } = props
  const navigate = useNavigate()
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const roles = (user?.roles ?? []).map((r) => r.toUpperCase())
  const nav = pickNav(roles)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed left-0 top-0 hidden border-r border-white/10 bg-zinc-950/90 md:flex md:flex-col h-dvh transition-all duration-300 ease-in-out z-50"
        style={{
          width: isSidebarCollapsed ? '5rem' : '17rem',
        }}
      >
          <div
            className={cn(
              'flex h-16 items-center border-b border-white/10 px-4 overflow-hidden',
              isSidebarCollapsed ? 'justify-end' : 'justify-between',
            )}
          >
            {!isSidebarCollapsed ? (
              <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/25">
                  <Archive className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold leading-none text-white">
                    Zero Inventory
                  </div>
                  <div className="mt-1 truncate text-xs text-white/60">Admin Panel</div>
                </div>
              </div>
            ) : null}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed((current) => !current)}
              className="h-9 w-9 shrink-0 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label={isSidebarCollapsed ? 'Abrir sidebar' : 'Cerrar sidebar'}
            >
              {isSidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto p-2 min-h-0">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-xl text-sm transition-all duration-200',
                    isSidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2',
                    isActive
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'text-white/65 hover:bg-white/5 hover:text-white',
                  )
                }
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span
                  className={cn(
                    'overflow-hidden whitespace-nowrap transition-all duration-200',
                    isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/10 p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg transition-all hover:bg-white/5 p-2',
                    isSidebarCollapsed ? 'justify-center' : '',
                  )}
                  aria-label="Menú de sesión"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white">
                    {status === 'authenticated' && user?.username
                      ? user.username.slice(0, 2).toUpperCase()
                      : '—'}
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-white">
                        {status === 'authenticated' ? user?.username : '—'}
                      </div>
                      <div className="text-xs text-white/40">Sesión</div>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isSidebarCollapsed ? 'end' : 'start'} className="w-56">
                <DropdownMenuLabel>
                  {status === 'authenticated' ? user?.username : 'Invitado'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/">Ir a inicio</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={async (e) => {
                    e.preventDefault()
                    await logout()
                    navigate('/login', { replace: true })
                  }}
                  className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        <div 
          className="flex min-w-0 flex-col h-dvh overflow-hidden"
          style={{
            marginLeft: isSidebarCollapsed ? '5rem' : '17rem',
          }}
        >
          <header className="flex h-16 items-center gap-3 border-b border-white/10 bg-white/5 px-4 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed((current) => !current)}
              className="h-10 w-10 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
              aria-label={isSidebarCollapsed ? 'Abrir sidebar' : 'Cerrar sidebar'}
            >
              {isSidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>

            <div className="min-w-0 flex-1">
              <Input
                placeholder="Buscar…"
                className="h-10 max-w-xl border-white/10 bg-zinc-950/70 text-white placeholder:text-white/40"
                aria-label="Buscar"
              />
            </div>

            <Button variant="ghost" size="icon" className="h-10 w-10 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Notificaciones">
              <Bell className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 border-white/10 bg-zinc-950/70 text-white hover:bg-white/5">
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
                  onSelect={async (e) => {
                    e.preventDefault()
                    await logout()
                    navigate('/login', { replace: true })
                  }}
                >
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 transition-all duration-300">
            {title ? (
              <div className="mb-6 flex items-center justify-between gap-4">
                <h1 className="text-xl font-semibold tracking-tight text-white">{title}</h1>
              </div>
            ) : null}
            <Outlet />
          </main>
        </div>
    </div>
  )
}
