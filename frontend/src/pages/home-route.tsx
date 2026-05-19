import { Navigate } from 'react-router-dom'

import { useAuthStore } from '@/modules/auth/application/auth.store'
import { Skeleton } from '@/shared/ui/skeleton'

export function HomeRoute() {
  const status = useAuthStore((s) => s.status)
  const isAdmin = useAuthStore((s) =>
    (s.user?.roles ?? []).some((r) => r.toUpperCase() === 'ADMIN'),
  )
  const isEmployee = useAuthStore((s) =>
    (s.user?.roles ?? []).some((r) => r.toUpperCase() === 'EMPLOYEE'),
  )

  if (status === 'unknown' || status === 'loading') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-4 w-96" />
        <Skeleton className="mt-10 h-40 w-full" />
      </div>
    )
  }

  if (status === 'authenticated') {
    if (isAdmin) return <Navigate to="/admin" replace />
    if (isEmployee) return <Navigate to="/admin/inventory" replace />
  }

  return <Navigate to="/tienda" replace />
}
