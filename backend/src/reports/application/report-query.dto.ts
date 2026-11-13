import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, Matches } from 'class-validator';
export class ReportQueryDTO {
  @ApiPropertyOptional({ example: '2026-11-01', description: 'Fecha calendario inicial del registro' })
  @IsOptional()
  @Matches(/^[1-9]\d{3}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-11-12', description: 'Fecha final inclusiva; máximo 366 días' })
  @IsOptional()
  @Matches(/^[1-9]\d{3}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  dateTo?: string;
}
