import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsIn, IsOptional, Matches } from 'class-validator';
import { EstadoPedidoEnum } from '../../domain/entity/pedido.entity';

export class FiltersMyOrdersDTO {
  @ApiPropertyOptional({ enum: EstadoPedidoEnum })
  @IsOptional()
  @IsEnum(EstadoPedidoEnum)
  estado?: EstadoPedidoEnum;

  @ApiPropertyOptional({ example: '2026-11-12' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-11-12' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  dateTo?: string;

  @ApiPropertyOptional({ enum: ['fecha_desc', 'fecha_asc', 'total_desc', 'total_asc'] })
  @IsOptional()
  @IsIn(['fecha_desc', 'fecha_asc', 'total_desc', 'total_asc'])
  sortBy?: 'fecha_desc' | 'fecha_asc' | 'total_desc' | 'total_asc';
}
