import { http } from '@/infrastructure/http/http'
import type { ReportsSnapshot } from '../domain/report.models'
import type { ReportRepository } from '../domain/report.repository'
export const reportRepository: ReportRepository = {
  async get(range) { return (await http.get<ReportsSnapshot>('/admin/reports', { params: range })).data },
}
