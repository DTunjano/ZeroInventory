import { Injectable, NotFoundException } from '@nestjs/common'
import { Media } from '../domain/media.models'
import { MediaRepository } from '../domain/media.repository'

/**
 * Use Case DEPRECATED: Marcas como principal no se usan más
 * Se mantiene por compatibilidad con el módulo
 * En el futuro puede eliminarse
 */
@Injectable()
export class TogglePrincipalMediaUseCase {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(id: number): Promise<Media> {
    const media = await this.mediaRepository.findById(id)
    if (!media) {
      throw new NotFoundException(`Media con ID ${id} no encontrado`)
    }

    // No hacer nada - esta funcionalidad fue deprecada
    return media
  }
}
