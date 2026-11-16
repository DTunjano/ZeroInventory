import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { Media } from '../domain/media.models'
import { MediaRepository } from '../domain/media.repository'
import { MediaCloudinaryService } from '../infrastructure/cloudinary/media-cloudinary.service'
import { CreateMediaDto } from './dto/create-media.dto'

/**
 * Use Case: Crear nuevo Media
 * Responsabilidades:
 * 1. Validar datos de entrada
 * 2. Subir archivo a Cloudinary
 * 3. Guardar metadata en BD
 */
@Injectable()
export class CreateMediaUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly cloudinaryService: MediaCloudinaryService,
  ) {}

  async execute(dto: CreateMediaDto, file: Express.Multer.File): Promise<Media> {
    // Validar que el archivo existe
    if (!file) {
      throw new BadRequestException('El archivo de video es requerido')
    }

    // Subir a Cloudinary
    let uploadResult: { secure_url: string; public_id: string }
    try {
      uploadResult = await this.cloudinaryService.uploadVideo(file)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException('Error al subir el archivo')
    }

    // Crear entidad Media con datos de Cloudinary
    const media = new Media(
      0, // ID generado por la BD
      dto.titulo,
      dto.descripcion ?? null,
      uploadResult.secure_url,
      uploadResult.public_id,
      dto.tipo, // Usar tipo del DTO
      'activo', // Siempre comienza activo
      0, // Orden por defecto
      new Date(),
      new Date(),
    )

    // Guardar en BD
    try {
      return await this.mediaRepository.save(media)
    } catch {
      // Si falla la BD, eliminar del archivo de Cloudinary
      await this.cloudinaryService.deleteVideo(uploadResult.public_id)
      throw new InternalServerErrorException('Error al guardar el media en la base de datos')
    }
  }
}

