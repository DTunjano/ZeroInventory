import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Link, Route, Routes } from 'react-router-dom'
import { BrowserRouter, Outlet } from 'react-router-dom'

import { AuthBootstrap } from '@/modules/auth/presentation/auth-bootstrap'
import { RequireAuth } from '@/modules/auth/presentation/require-auth'
import { useAuthStore } from '@/modules/auth/application/auth.store'
import { AdminProductsPage } from '@/modules/products/presentation/admin-products-page'
import { AdminHomePage } from '@/pages/admin/admin-home-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { LoginPage } from '@/pages/login-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { Button } from '@/shared/ui/button'
import { Sonner } from '@/shared/ui/sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

function AppShell() {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link className="font-semibold tracking-tight" to="/">
              Zero Inventory
            </Link>
            <nav className="text-sm text-muted-foreground">
              <Link className="hover:text-foreground" to="/admin">
                Admin
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {status === 'authenticated' ? (
              <>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {user?.username}
                </span>
                <Button variant="outline" size="sm" onClick={() => void logout()}>
                  Salir
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <Sonner />
    </div>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap />
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route element={<RequireAuth roles={['admin']} />}>
              <Route path="admin" element={<AdminHomePage />} />
              <Route path="admin/products" element={<AdminProductsPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
