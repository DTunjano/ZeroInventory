import { BadRequestException, Injectable } from '@nestjs/common';
import { ReportRepository } from '../domain/report.repository';
import { ReportQueryDTO } from './report-query.dto';

@Injectable()
export class GetReportsUseCase {
  constructor(private readonly reports: ReportRepository) {}
  execute(query: ReportQueryDTO) {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());
    const dateFrom = query.dateFrom ?? `${today.slice(0, 7)}-01`;
    const dateTo = query.dateTo ?? today;
    const days = (Date.parse(`${dateTo}T00:00:00Z`) - Date.parse(`${dateFrom}T00:00:00Z`)) / 86400000 + 1;
    if (!Number.isFinite(days) || days < 1 || days > 366) throw new BadRequestException('Selecciona un rango válido de hasta 366 días');
    return this.reports.snapshot({ dateFrom, dateTo });
  }
}
