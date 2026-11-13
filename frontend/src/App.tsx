import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, Routes, BrowserRouter } from 'react-router-dom'

import { AuthBootstrap } from '@/modules/auth/presentation/auth-bootstrap'
import { ThemeSync } from '@/modules/settings/presentation/theme-sync'
import { RequireAuth } from '@/modules/auth/presentation/require-auth'
const AdminProductsPage = lazy(() => import('@/modules/products/presentation/admin-products-page').then((module) => ({ default: module.AdminProductsPage })))
const AdminInventoryPage = lazy(() => import('@/modules/inventory/presentation/admin-inventory-page').then((module) => ({ default: module.AdminInventoryPage })))
const AdminDashboardPage = lazy(() => import('@/pages/admin/admin-dashboard-page').then((module) => ({ default: module.AdminDashboardPage })))
const AdminInventoryAdjustmentsPage = lazy(() => import('@/pages/admin/admin-inventory-adjustments-page').then((module) => ({ default: module.AdminInventoryAdjustmentsPage })))
const AdminSuppliersPage = lazy(() => import('@/modules/suppliers/presentation/suppliers-page').then((module) => ({ default: module.SuppliersPage })))
const AdminUsersPage = lazy(() => import('@/pages/admin/admin-users-page').then((module) => ({ default: module.AdminUsersPage })))
const AdminEmployeesPage = lazy(() => import('@/modules/employee/presentation/admin-employees-page').then((module) => ({ default: module.AdminEmployeesPage })))
const AdminReportsPage = lazy(() => import('@/pages/admin/admin-reports-page').then((module) => ({ default: module.AdminReportsPage })))
const MediaPage = lazy(() => import('@/modules/media/presentation/MediaPage').then((module) => ({ default: module.MediaPage })))
const HomePage = lazy(() => import('@/modules/home').then((module) => ({ default: module.HomePage })))
const HomeRoute = lazy(() => import('@/pages/home-route').then((module) => ({ default: module.HomeRoute })))
const StoreHomePage = lazy(() => import('@/pages/store/store-home-page').then((module) => ({ default: module.StoreHomePage })))
const LoginPage = lazy(() => import('@/pages/login-page').then((module) => ({ default: module.LoginPage })))
const MyCartPage = lazy(() => import('@/pages/me/my-cart-page').then((module) => ({ default: module.MyCartPage })))
const MyOrdersPage = lazy(() => import('@/pages/me/my-orders-page').then((module) => ({ default: module.MyOrdersPage })))
const MyDireccionesPage = lazy(() => import('@/pages/me/my-direcciones-page').then((module) => ({ default: module.MyDireccionesPage })))
const RegisterPage = lazy(() => import('@/pages/register-page').then((module) => ({ default: module.RegisterPage })))
const NotFoundPage = lazy(() => import('@/pages/not-found-page').then((module) => ({ default: module.NotFoundPage })))
const SettingsPage = lazy(() => import('@/modules/settings/presentation/settings-page').then((module) => ({ default: module.SettingsPage })))
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
        <ThemeSync />
        <Suspense fallback={<div role="status" className="p-8 text-center">Cargando...</div>}>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="home" element={<HomePage />} />

          <Route element={<AppLayout />}>
            <Route index element={<HomeRoute />} />
            <Route path="tienda" element={<StoreHomePage />} />

            {/* Rutas compartidas entre ADMIN y EMPLOYEE (mismas vistas) */}
            <Route element={<RequireAuth roles={['ADMIN', 'EMPLOYEE']} />}>
              <Route path="admin/inventory" element={<AdminInventoryPage />} />
              <Route path="admin/inventory-adjustments" element={<AdminInventoryAdjustmentsPage />} />
              <Route path="admin/products" element={<AdminProductsPage />} />
              <Route path="admin/suppliers" element={<AdminSuppliersPage />} />
            </Route>

            {/* Rutas exclusivas de ADMIN */}
            <Route element={<RequireAuth roles={['ADMIN']} />}>
              <Route path="admin" element={<AdminDashboardPage />} />
              <Route path="admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="admin/users" element={<AdminUsersPage />} />
              <Route path="admin/employees" element={<AdminEmployeesPage />} />
              <Route path="admin/reports" element={<AdminReportsPage />} />
              <Route path="admin/media" element={<MediaPage />} />
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
        </Suspense>

        <Sonner />
        <FloatingCartButton />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
