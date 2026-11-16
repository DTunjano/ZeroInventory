import { Injectable, NotFoundException } from '@nestjs/common'
import { MediaRepository } from '../domain/media.repository'
import { MediaCloudinaryService } from '../infrastructure/cloudinary/media-cloudinary.service'

/**
 * Use Case: Eliminar Media (Soft Delete)
 * Responsabilidades:
 * 1. Validar que el media existe
 * 2. Marcar como inactivo en BD
 * 3. Eliminar de Cloudinary (opcional - se puede mantener en CDN)
 */
@Injectable()
export class DeleteMediaUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly cloudinaryService: MediaCloudinaryService,
  ) {}

  async execute(id: number): Promise<void> {
    // Validar que el media existe
    const media = await this.mediaRepository.findById(id)
    if (!media) {
      throw new NotFoundException(`Media con ID ${id} no encontrado`)
    }

    // Eliminar de Cloudinary (no es crítico si falla)
    await this.cloudinaryService.deleteVideo(media.publicId)

    // Marcar como inactivo (soft delete)
    await this.mediaRepository.delete(id)
  }
}
