import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Building,
  Truck,
  Briefcase,
  BarChart3,
  House,
  LayoutGrid,
  Package,
  ShoppingCart,
  Archive,
  Settings,
  SlidersHorizontal,
  Menu,
  X,
  LogOut,
  Bell,
  Sparkles,
  HelpCircle,
  Film,
} from 'lucide-react'
import type { ComponentType } from 'react'

import { useAuthStore } from '@/modules/auth/application/auth.store'
import { useSettingsStore } from '@/modules/settings/application/settings.store'
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

/** Navegación exclusiva para ADMIN */
const adminOnlyNav: AppLayoutNavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/admin/employees', label: 'Empleados', icon: Briefcase },
  { to: '/admin/reports', label: 'Reportes', icon: BarChart3 },
  { to: '/admin/media', label: 'Contenido', icon: Film },
]

/** Navegación compartida entre ADMIN y EMPLOYEE */
const sharedNav: AppLayoutNavItem[] = [
  { to: '/home', label: 'Home', icon: House },
  { to: '/admin/inventory', label: 'Inventario', icon: Archive },
  { to: '/admin/inventory-adjustments', label: 'Ajustes de inventario', icon: SlidersHorizontal },
  { to: '/admin/products', label: 'Productos', icon: Package },
  { to: '/admin/suppliers', label: 'Proveedores', icon: Truck },
  { to: '/settings', label: 'Configuración', icon: Settings },
]

/** Navegación para CUSTOMER */
const customerNav: AppLayoutNavItem[] = [
  { to: '/home', label: 'Home', icon: House },
  { to: '/tienda', label: 'Tienda', icon: LayoutGrid },
  { to: '/me/cart', label: 'Carrito', icon: ShoppingCart },
  { to: '/me/orders', label: 'Mis pedidos', icon: Package },
  { to: '/me/direcciones', label: 'Direcciones', icon: Building },
  { to: '/settings', label: 'Configuración', icon: Settings },
]

function pickNav(roles: string[]): AppLayoutNavItem[] {
  const isAdmin = roles.includes('ADMIN')
  const isEmployee = roles.includes('EMPLOYEE')

  if (isAdmin) {
    return [...adminOnlyNav, ...sharedNav]
  }

  if (isEmployee) {
    return [...sharedNav]
  }

  return customerNav
}

const sidebarLabelByRole: Record<RoleKey, string> = {
  ADMIN: 'Panel de Admin',
  EMPLOYEE: 'Panel de Empleado',
  CUSTOMER: 'Mi Tienda',
}

function pickSidebarLabel(roles: string[]): string {
  if (roles.includes('ADMIN')) return sidebarLabelByRole.ADMIN
  if (roles.includes('EMPLOYEE')) return sidebarLabelByRole.EMPLOYEE
  return sidebarLabelByRole.CUSTOMER
}

const guestNav: AppLayoutNavItem[] = [
  { to: '/home', label: 'Home', icon: House },
  { to: '/tienda', label: 'Tienda', icon: LayoutGrid },
]

export function AppLayout(props: { title?: string }) {
  const { title } = props
  const navigate = useNavigate()
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const theme = useSettingsStore((s) => s.theme)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const isAuthenticated = status === 'authenticated'

  const roles = (user?.roles ?? []).map((r) => r.toUpperCase())
  const nav = isAuthenticated ? pickNav(roles) : guestNav
  const sidebarLabel = pickSidebarLabel(roles)
  const isDark = theme === 'dark'
  const accountDisplayName = isAuthenticated ? user?.username : 'Cuenta'
  const accountLabel = isAuthenticated ? user?.username : 'Cuenta'
  const accountActionLabel = isAuthenticated ? 'Cerrar sesión' : 'Iniciar sesión'

  const goToAuthEntry = useMemo(
    () => async () => {
      if (isAuthenticated) {
        await logout()
      }
      navigate('/login', { replace: true })
    },
    [isAuthenticated, logout, navigate],
  )

  return (
    <div className={cn('min-h-dvh transition-colors duration-200', isDark ? 'bg-background text-foreground' : 'bg-white text-slate-900')}>
      <aside className={cn('fixed left-0 top-0 hidden border-r md:flex md:flex-col h-dvh transition-all duration-300 ease-in-out z-50', isDark ? 'border-white/10 bg-zinc-950/90' : 'border-slate-200 bg-white')}
        style={{
          width: isSidebarCollapsed ? '5rem' : '17rem',
        }}
      >
          <div
            className={cn(
              'flex h-16 items-center px-4 overflow-hidden',
              isDark ? 'border-b border-white/10' : 'border-b border-slate-200',
              isSidebarCollapsed ? 'justify-end' : 'justify-between',
            )}
          >
            {!isSidebarCollapsed ? (
              <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/25">
                  <Archive className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className={cn('truncate text-base font-semibold leading-none', isDark ? 'text-white' : 'text-slate-900')}>
                    Zero Inventory
                  </div>
                  <div className={cn('mt-1 truncate text-xs', isDark ? 'text-white/60' : 'text-slate-500')}>
                    {sidebarLabel}
                  </div>
                </div>
              </div>
            ) : null}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed((current) => !current)}
              className={cn('h-9 w-9 shrink-0', isDark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900')}
              aria-label={isSidebarCollapsed ? 'Abrir sidebar' : 'Cerrar sidebar'}
            >
              {isSidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>

          <nav className={cn('flex-1 overflow-y-auto p-2 min-h-0', isDark ? 'bg-zinc-950/90' : 'bg-white')}>
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
                      : isDark
                        ? 'text-white/65 hover:bg-white/5 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
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

          <div className={cn('mt-auto border-t p-3', isDark ? 'border-white/10' : 'border-slate-200')}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg transition-all p-2',
                    isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100',
                    isSidebarCollapsed ? 'justify-center' : '',
                  )}
                  aria-label="Menú de sesión"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white">
                    {isAuthenticated && user?.username
                      ? user.username.slice(0, 2).toUpperCase()
                      : '—'}
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="min-w-0 flex-1">
                      <div className={cn('truncate text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                        {accountDisplayName}
                      </div>
                      <div className={cn('text-xs', isDark ? 'text-white/40' : 'text-slate-500')}>
                        Sesión
                      </div>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isSidebarCollapsed ? 'end' : 'start'} className="w-56">
                <DropdownMenuLabel>
                  {accountLabel}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/home">Ir a inicio</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={async (e) => {
                    e.preventDefault()
                    await goToAuthEntry()
                  }}
                  className={cn(
                    isAuthenticated ? 'text-red-400 focus:bg-red-500/10 focus:text-red-300' : 'text-blue-400 focus:bg-blue-500/10 focus:text-blue-300',
                  )}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {accountActionLabel}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        <div 
          className="flex min-w-0 flex-col h-dvh overflow-hidden transition-colors duration-200"
          style={{
            marginLeft: isSidebarCollapsed ? '5rem' : '17rem',
          }}
        >
          <header className={cn('app-topbar flex h-16 items-center gap-3 border-b px-4 backdrop-blur-sm', isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50')}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed((current) => !current)}
              className={cn('h-10 w-10 md:hidden', isDark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900')}
              aria-label={isSidebarCollapsed ? 'Abrir sidebar' : 'Cerrar sidebar'}
            >
              {isSidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="icon" className={cn(isDark ? 'text-white/70' : 'text-slate-600')}>
                  <Link to="/tienda">
                    <LayoutGrid className="h-5 w-5" />
                  </Link>
                </Button>

                <Button variant="ghost" size="icon" className={cn(isDark ? 'text-white/70' : 'text-slate-600')} title="Ofertas">
                  <Sparkles className="h-5 w-5" />
                </Button>

                <Button variant="ghost" size="icon" className={cn(isDark ? 'text-white/70' : 'text-slate-600')} title="Ayuda">
                  <HelpCircle className="h-5 w-5" />
                </Button>

                <div className={cn('ml-4 hidden min-w-0 items-center gap-2 rounded-2xl px-3 py-2', isDark ? 'bg-white/3' : 'bg-slate-100')}>
                  <div className={cn('text-sm font-medium', isDark ? 'text-white/80' : 'text-slate-800')}>Súper atajos</div>
                  <div className={cn('text-xs', isDark ? 'text-white/50' : 'text-slate-500')}>Accede rápido a la tienda y soporte</div>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="icon" className={cn('h-10 w-10', isDark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')} aria-label="Notificaciones">
              <Bell className="h-4 w-4" />
            </Button>

            {/* Usuario: eliminado del header porque ya existe en la sidebar */}
          </header>

          <main className={cn('min-w-0 flex-1 overflow-y-auto px-4 py-6 transition-all duration-300', isDark ? 'bg-background' : 'bg-white')}>
            {title ? (
              <div className="mb-6 flex items-center justify-between gap-4">
                <h1 className={cn('text-xl font-semibold tracking-tight', isDark ? 'text-white' : 'text-slate-900')}>{title}</h1>
              </div>
            ) : null}
            <Outlet />
          </main>
        </div>
    </div>
  )
}
