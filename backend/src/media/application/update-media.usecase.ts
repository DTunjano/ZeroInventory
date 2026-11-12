import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { Media } from '../domain/media.models'
import { MediaRepository } from '../domain/media.repository'
import { UpdateMediaDto } from './dto/update-media.dto'
import { MediaCloudinaryService } from '../infrastructure/cloudinary/media-cloudinary.service'

/**
 * Use Case: Actualizar Media
 * Responsabilidades:
 * 1. Validar que el media existe
 * 2. Validar datos de entrada
 * 3. Actualizar en BD
 */
@Injectable()
export class UpdateMediaUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly cloudinaryService: MediaCloudinaryService,
  ) {}

  async execute(id: number, dto: UpdateMediaDto, file?: Express.Multer.File): Promise<Media> {
    // Validar que el media existe
    const media = await this.mediaRepository.findById(id)
    if (!media) {
      throw new NotFoundException(`Media con ID ${id} no encontrado`)
    }

    // Actualizar solo los campos permitidos
    const updateData: Partial<Media> = {}

    if (dto.tipo !== undefined) {
      updateData.tipo = dto.tipo
    }

    if (dto.titulo !== undefined) {
      if (dto.titulo.trim().length === 0) {
        throw new BadRequestException('El título no puede estar vacío')
      }
      updateData.titulo = dto.titulo.trim()
    }

    if (dto.descripcion !== undefined) {
      updateData.descripcion = dto.descripcion?.trim() || null
    }

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadVideo(file)
      updateData.url = uploadResult.secure_url
      updateData.publicId = uploadResult.public_id

    }

    // Guardar cambios
    let saved: Media
    try {
      saved = await this.mediaRepository.update(id, updateData)
    } catch {
      if (file && updateData.publicId) {
        await this.cloudinaryService.deleteVideo(updateData.publicId)
      }
      throw new InternalServerErrorException('Error al actualizar el media')
    }
    if (file && media.publicId) await this.cloudinaryService.deleteVideo(media.publicId)
    return saved
  }
}
