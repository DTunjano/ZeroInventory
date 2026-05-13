import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { BrowserRouter, Outlet } from 'react-router-dom'

import { AuthBootstrap } from '@/modules/auth/presentation/auth-bootstrap'
import { RequireAuth } from '@/modules/auth/presentation/require-auth'
import { useAuthStore } from '@/modules/auth/application/auth.store'
import { AdminProductsPage } from '@/modules/products/presentation/admin-products-page'
import { AdminInventoryPage } from '@/modules/inventory/presentation/admin-inventory-page'
import { AdminDashboardPage } from '@/pages/admin/admin-dashboard-page'
import { AdminInventoryAdjustmentsPage } from '@/pages/admin/admin-inventory-adjustments-page'
import { AdminReportsPage } from '@/pages/admin/admin-reports-page'
import { AdminUsersPage } from '@/pages/admin/admin-users-page'
import { AdminEmployeesPage } from '@/modules/employee/presentation/admin-employees-page'
import { EmployeeDashboardPage } from '@/pages/employee/employee-dashboard-page'
import { EmployeeProductsPage } from '@/pages/employee/employee-products-page'
import { HomeRoute } from '@/pages/home-route'
import { LoginPage } from '@/pages/login-page'
import { MyCartPage } from '@/pages/me/my-cart-page'
import { MyOrdersPage } from '@/pages/me/my-orders-page'
import { RegisterPage } from '@/pages/register-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { SettingsPage } from '@/pages/settings-page'
import { Button } from '@/shared/ui/button'
import { Sonner } from '@/shared/ui/sonner'
import { AppLayout } from '@/shared/layouts/app-layout'

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
  const navigate = useNavigate()

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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await logout()
                    navigate('/login', { replace: true })
                  }}
                >
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
    </div>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap />
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          <Route element={<AppLayout />}>
            <Route index element={<HomeRoute />} />

            <Route element={<RequireAuth roles={['ADMIN']} />}>
              <Route path="admin" element={<AdminDashboardPage />} />
              <Route path="admin/inventory" element={<AdminInventoryPage />} />
              <Route path="admin/inventory-adjustments" element={<AdminInventoryAdjustmentsPage />} />
              <Route path="admin/products" element={<AdminProductsPage />} />
              <Route path="admin/users" element={<AdminUsersPage />} />
              <Route path="admin/employees" element={<AdminEmployeesPage />} />
              <Route path="admin/reports" element={<AdminReportsPage />} />
            </Route>

            <Route element={<RequireAuth roles={['EMPLOYEE']} />}>
              <Route path="employee" element={<EmployeeDashboardPage />} />
              <Route path="employee/products" element={<EmployeeProductsPage />} />
            </Route>

            <Route element={<RequireAuth roles={['CUSTOMER']} />}>
              <Route path="me/cart" element={<MyCartPage />} />
              <Route path="me/orders" element={<MyOrdersPage />} />
            </Route>

            <Route element={<RequireAuth roles={['ADMIN', 'EMPLOYEE', 'CUSTOMER']} />}>
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="shell" element={<AppShell />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>

        <Sonner />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
