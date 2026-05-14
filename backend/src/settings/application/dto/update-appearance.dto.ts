import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateAppearanceDto {
  @ApiProperty({ description: 'Tema visual', enum: ['dark', 'light'] })
  @IsIn(['dark', 'light'])
  theme!: 'dark' | 'light';
}