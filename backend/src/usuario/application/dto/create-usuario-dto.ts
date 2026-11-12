import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsEnum, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength, IsNotEmpty } from 'class-validator';
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity';

export class CreateUsuarioDTO {
  @ApiProperty({ enum: RolNombreEnum, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(RolNombreEnum, { each: true })
  roles!: RolNombreEnum[];

  @ApiPropertyOptional({ description: 'Documento requerido al crear un perfil de cliente' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  documento?: string;
  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'john_doe',
    type: String,
  })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @IsString()
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @MinLength(3, {
    message: 'El nombre de usuario debe tener mínimo 3 caracteres',
  })
  username!: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'SecurePassword123!',
    type: String,
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  @MaxLength(72, { message: 'La contraseña admite máximo 72 caracteres' })
  password!: string;

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
    description: 'Teléfono del usuario',
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
    description: 'Primer nombre del usuario',
    example: 'John',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() || null : value)
  primerNombre!: string | null;

  @ApiPropertyOptional({
    description: 'Segundo nombre del usuario',
    example: 'Alexander',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() || null : value)
  segundoNombre!: string | null;

  @ApiPropertyOptional({
    description: 'Primer apellido del usuario',
    example: 'Doe',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() || null : value)
  primerApellido!: string | null;

  @ApiPropertyOptional({
    description: 'Segundo apellido del usuario',
    example: 'Smith',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() || null : value)
  segundoApellido!: string | null;
}
