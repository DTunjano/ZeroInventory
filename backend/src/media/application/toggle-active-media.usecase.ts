import { Injectable, NotFoundException } from '@nestjs/common'
import { Media } from '../domain/media.models'
import { MediaRepository } from '../domain/media.repository'

/**
 * Use Case: Cambiar estado del Media (activo <-> inactivo)
 */
@Injectable()
export class ToggleActiveMediaUseCase {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(id: number): Promise<Media> {
    // Validar que el media existe
    const media = await this.mediaRepository.findById(id)
    if (!media) {
      throw new NotFoundException(`Media con ID ${id} no encontrado`)
    }

    // Cambiar estado
    return await this.mediaRepository.toggleEstado(id)
  }
}
