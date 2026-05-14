import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, Routes, BrowserRouter } from 'react-router-dom'

import { AuthBootstrap } from '@/modules/auth/presentation/auth-bootstrap'
import { RequireAuth } from '@/modules/auth/presentation/require-auth'
import { AdminProductsPage } from '@/modules/products/presentation/admin-products-page'
import { AdminInventoryPage } from '@/modules/inventory/presentation/admin-inventory-page'
import { AdminDashboardPage } from '@/pages/admin/admin-dashboard-page'
import { AdminInventoryAdjustmentsPage } from '@/pages/admin/admin-inventory-adjustments-page'
import { SuppliersPage as AdminSuppliersPage } from '@/modules/suppliers/presentation/suppliers-page'
import { AdminUsersPage } from '@/pages/admin/admin-users-page'
import { AdminEmployeesPage } from '@/modules/employee/presentation/admin-employees-page'
import { AdminReportsPage } from '@/pages/admin/admin-reports-page'
import { EmployeeDashboardPage } from '@/pages/employee/employee-dashboard-page'
import { EmployeeProductsPage } from '@/pages/employee/employee-products-page'
import { HomeRoute } from '@/pages/home-route'
import { LoginPage } from '@/pages/login-page'
import { MyCartPage } from '@/pages/me/my-cart-page'
import { MyOrdersPage } from '@/pages/me/my-orders-page'
import { MyDireccionesPage } from '@/pages/me/my-direcciones-page'
import { RegisterPage } from '@/pages/register-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { SettingsPage } from '@/modules/settings/presentation/settings-page'
import { Sonner } from '@/shared/ui/sonner'
import { AppLayout } from '@/shared/layouts/app-layout'
import { FloatingCartButton } from '@/shared/components/FloatingCartButton'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

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
              <Route path="admin/suppliers" element={<AdminSuppliersPage />} />
              <Route path="admin/reports" element={<AdminReportsPage />} />
            </Route>

            <Route element={<RequireAuth roles={['EMPLOYEE']} />}>
              <Route path="employee" element={<EmployeeDashboardPage />} />
              <Route path="employee/products" element={<EmployeeProductsPage />} />
            </Route>

            <Route element={<RequireAuth roles={['CUSTOMER']} />}>
              <Route path="me/cart" element={<MyCartPage />} />
              <Route path="me/orders" element={<MyOrdersPage />} />
              <Route path="me/direcciones" element={<MyDireccionesPage />} />
            </Route>

            <Route element={<RequireAuth roles={['ADMIN', 'EMPLOYEE', 'CUSTOMER']} />}>
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>

        <Sonner />
        <FloatingCartButton />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
