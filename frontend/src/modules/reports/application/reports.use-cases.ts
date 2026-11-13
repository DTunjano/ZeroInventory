import { reportRepository } from '../infrastructure/report.repository.http'
import type { ReportRange } from '../domain/report.models'
export const getReports = (range: ReportRange) => reportRepository.get(range)
