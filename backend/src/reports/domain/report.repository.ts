import { ReportRange, ReportsSnapshot } from './report.types';
export abstract class ReportRepository {
  abstract snapshot(range: ReportRange): Promise<ReportsSnapshot>;
}
