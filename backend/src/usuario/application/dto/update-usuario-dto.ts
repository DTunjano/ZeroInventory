import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsEnum, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity';

export class UpdateUsuarioDTO {
  @ApiPropertyOptional({ enum: RolNombreEnum, isArray: true })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(RolNombreEnum, { each: true })
  roles?: RolNombreEnum[];

  @ApiPropertyOptional({ description: 'Solo para crear un perfil CUSTOMER que todavía no existe' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  documento?: string;
  @ApiPropertyOptional({
    description: 'Nombre de usuario',
    example: 'john_doe',
    type: String,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @IsString()
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @MinLength(3, {
    message: 'El nombre de usuario debe tener mínimo 3 caracteres',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'Contraseña del usuario',
    example: 'SecurePassword123!',
    type: String,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  @MaxLength(72)
  password?: string;

  @ApiPropertyOptional({
    description: 'Primer nombre del usuario',
    example: 'John',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() || null : value)
  primerNombre?: string | null;

  @ApiPropertyOptional({
    description: 'Segundo nombre del usuario',
    example: 'Alexander',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() || null : value)
  segundoNombre?: string | null;

  @ApiPropertyOptional({
    description: 'Primer apellido del usuario',
    example: 'Doe',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() || null : value)
  primerApellido?: string | null;

  @ApiPropertyOptional({
    description: 'Segundo apellido del usuario',
    example: 'Smith',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() || null : value)
  segundoApellido?: string | null;

  @ApiPropertyOptional({
    description: 'Correo electrónico del usuario',
    example: 'john@example.com',
    type: String,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() || null : value)
  email?: string | null;

  @ApiPropertyOptional({
    description: 'Número de teléfono del usuario',
    example: '+57 300 123 4567',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9+()\-\s]{7,20}$/, {
    message: 'El teléfono no tiene un formato válido',
  })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() || null : value)
  telefono?: string | null;

  @ApiPropertyOptional({
    description: 'Estado activo del usuario',
    example: true,
    type: Boolean,
  })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}
