import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/adapters/decorators/roles.decorator';
import { GetReportsUseCase } from '../application/get-reports.use-case';
import { ReportQueryDTO } from '../application/report-query.dto';

@ApiTags('Reportes')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly reports: GetReportsUseCase) {}
  @Get()
  @ApiOperation({ summary: 'Reportes operativos de solo lectura con período y snapshot consistente' })
  get(@Query() query: ReportQueryDTO) { return this.reports.execute(query); }
}
