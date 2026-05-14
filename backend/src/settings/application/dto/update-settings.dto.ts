import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator';

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
  @ApiPropertyOptional({ description: 'Nombre de usuario' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener mínimo 3 caracteres' })
  @Transform(({ value }: { value: string }) => value?.trim())
  username?: string;

  @ApiPropertyOptional({ description: 'Correo electrónico del usuario' })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email?: string | null;

  @ApiPropertyOptional({ description: 'Número de teléfono del usuario' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9+()\-\s]{7,20}$/, {
    message: 'El teléfono no tiene un formato válido',
  })
  @Transform(({ value }: { value: string }) => value?.trim() || null)
  telefono?: string | null;

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

  @ApiPropertyOptional({ description: 'Dirección del usuario' })
  @IsOptional()
  address?: AddressDto;

  @ApiPropertyOptional({ description: 'Tema de la aplicación' })
  @IsOptional()
  @IsIn(['dark', 'light'])
  @Transform(({ value }: { value: string }) => value?.trim())
  theme?: 'dark' | 'light';
}
