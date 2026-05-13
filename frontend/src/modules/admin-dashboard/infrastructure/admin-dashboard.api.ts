import { http } from '@/infrastructure/http/http'

import type { AdminDashboardResponse } from '../domain/admin-dashboard.models'

export class AdminDashboardApi {
  async getDashboard(): Promise<AdminDashboardResponse> {
    const { data } = await http.get<AdminDashboardResponse>('/admin/dashboard')
    return data
  }
}

export const adminDashboardApi = new AdminDashboardApi()