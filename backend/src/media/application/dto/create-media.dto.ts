import { IsString, IsNotEmpty, IsOptional, MaxLength, IsIn } from 'class-validator'

/**
 * DTO para crear un nuevo Media
 * El cliente envía: tipo + titulo + descripcion + file (multipart)
 * FileInterceptor captura el file automáticamente
 * El backend genera: url (Cloudinary) + publicId + estado (activo)
 */
export class CreateMediaDto {
  @IsString()
  @IsNotEmpty({ message: 'El tipo de media es requerido' })
  @IsIn(['video', 'image'], { message: 'El tipo debe ser "video" o "image"' })
  tipo!: 'video' | 'image'

  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  @MaxLength(150, { message: 'El título no puede exceder 150 caracteres' })
  titulo!: string

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  descripcion?: string | null
}
