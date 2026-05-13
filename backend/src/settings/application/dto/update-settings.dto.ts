import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

class AddressDto {
  @IsString()
  lineaDir!: string;

  @IsString()
  barrio!: string;

  @IsOptional()
  @IsString()
  codigoPostal?: string | null;

  @IsOptional()
  @IsString()
  infoAdicional?: string | null;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ description: 'Primer nombre del usuario' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  primerNombre?: string;

  @ApiPropertyOptional({ description: 'Segundo nombre del usuario' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  segundoNombre?: string;

  @ApiPropertyOptional({ description: 'Primer apellido del usuario' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  primerApellido?: string;

  @ApiPropertyOptional({ description: 'Segundo apellido del usuario' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  segundoApellido?: string;

  @ApiPropertyOptional({ description: 'Correo electrónico del usuario' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email?: string;

  @ApiPropertyOptional({ description: 'Tema de la aplicación' })
  @IsOptional()
  @IsIn(['dark', 'light'])
  theme?: 'dark' | 'light';

  @ApiPropertyOptional({ description: 'Dirección del usuario' })
  @IsOptional()
  address?: AddressDto;
}
