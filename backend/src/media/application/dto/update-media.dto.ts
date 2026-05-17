import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator'

/**
 * DTO para actualizar Media
 * El cliente puede enviar: tipo (opcional), titulo, descripcion, file (opcional multipart)
 * FileInterceptor captura el file automáticamente si está presente
 * NO puede editar: estado (usa endpoint separado para toggle)
 */
export class UpdateMediaDto {
  @IsString()
  @IsOptional()
  @IsIn(['video', 'image'], { message: 'El tipo debe ser "video" o "image"' })
  tipo?: 'video' | 'image'

  @IsString()
  @IsOptional()
  @MaxLength(150, { message: 'El título no puede exceder 150 caracteres' })
  titulo?: string

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  descripcion?: string | null
}
