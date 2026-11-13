import { useAuthStore } from '@/modules/auth/application/auth.store'

type UserRole = 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER'

export interface Permissions {
  /** Puede crear registros en el módulo actual */
  canCreate: boolean
  /** Puede editar registros en el módulo actual */
  canEdit: boolean
  /** Puede eliminar (hard delete) registros en el módulo actual. Solo ADMIN. */
  canDelete: boolean
  /** Puede activar/desactivar (soft delete / toggle) registros. ADMIN y EMPLOYEE. */
  canDeactivate: boolean
  /** Puede acceder al módulo de Dashboard. Solo ADMIN. */
  canAccessDashboard: boolean
  /** Puede acceder al módulo de Empleados. Solo ADMIN. */
  canAccessEmployees: boolean
  /** Puede acceder al módulo de Reportes. Solo ADMIN. */
  canAccessReports: boolean
  /** Rol del usuario actual */
  role: UserRole | null
  /** Verifica si el usuario tiene alguno de los roles permitidos */
  hasRole: (...roles: UserRole[]) => boolean
  /** Verifica si es CUSTOMER */
  isCustomer: boolean
}

/**
 * Hook reutilizable para determinar los permisos del usuario autenticado.
 *
 * Escalabilidad:
 * - Soporte para múltiples roles (ADMIN, EMPLOYEE, CUSTOMER).
 * - Fácil de extender con permisos granulares por módulo.
 * - Centralizado: si cambia la lógica de permisos, se modifica en un solo lugar.
 */
export function usePermissions(): Permissions {
  const user = useAuthStore((s) => s.user)

  const roles = (user?.roles ?? []).map((r) => r.toUpperCase())
  const isAdmin = roles.includes('ADMIN')
  const isEmployee = roles.includes('EMPLOYEE')
  const isCustomer = roles.includes('CUSTOMER')

  return {
    canCreate: isAdmin || isEmployee,
    canEdit: isAdmin || isEmployee,
    canDelete: isAdmin,
    canDeactivate: isAdmin || isEmployee,
    canAccessDashboard: isAdmin,
    canAccessEmployees: isAdmin,
    canAccessReports: isAdmin,
    role: (isAdmin ? 'ADMIN' : isEmployee ? 'EMPLOYEE' : isCustomer ? 'CUSTOMER' : roles[0] ?? null) as UserRole | null,
    hasRole: (...allowed) => allowed.some((r) => roles.includes(r)),
    isCustomer,
  }
}
