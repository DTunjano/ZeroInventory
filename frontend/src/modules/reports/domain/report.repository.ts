import type { ReportRange, ReportsSnapshot } from './report.models'
export interface ReportRepository { get(range: ReportRange): Promise<ReportsSnapshot> }
