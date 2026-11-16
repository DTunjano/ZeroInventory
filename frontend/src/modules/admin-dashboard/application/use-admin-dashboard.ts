import { useQuery } from '@tanstack/react-query'

import { adminDashboardApi } from '../infrastructure/admin-dashboard.api'

const ADMIN_DASHBOARD_KEY = ['admin-dashboard'] as const

export function useAdminDashboard() {
  return useQuery({
    queryKey: ADMIN_DASHBOARD_KEY,
    queryFn: () => adminDashboardApi.getDashboard(),
    staleTime: 60_000,
  })
}