import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '../application/auth.store'
import type { AuthRole } from '../domain/auth.models'

import { Skeleton } from '@/shared/ui/skeleton'

export function RequireAuth(props: { roles?: AuthRole[] }) {
  const { roles } = props
  const location = useLocation()
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)

  if (status === 'unknown' || status === 'loading') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-4 w-96" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  if (roles && roles.length > 0) {
    const userRoles = (user?.roles ?? []).map((r) => r.toUpperCase())
    const requiredRoles = roles.map((r) => r.toUpperCase())
    const allowed = requiredRoles.some((r) => userRoles.includes(r))
    if (!allowed) {
      return <Navigate to="/" replace />
    }
  }

  return <Outlet />
}
