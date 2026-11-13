import { Module } from '@nestjs/common';
import { ReportRepository } from './domain/report.repository';
import { TypeOrmReportRepository } from './infrastructure/report.repository.typeorm';
import { GetReportsUseCase } from './application/get-reports.use-case';
import { ReportsController } from './adapters/reports.controller';
@Module({
  controllers: [ReportsController],
  providers: [GetReportsUseCase, { provide: ReportRepository, useClass: TypeOrmReportRepository }],
})
export class ReportsModule {}
