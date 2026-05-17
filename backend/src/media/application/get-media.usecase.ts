import { Injectable, NotFoundException } from '@nestjs/common'
import { Media } from '../domain/media.models'
import { MediaRepository, MediaFilters, PaginatedMediaResult } from '../domain/media.repository'

/**
 * Use Case: Obtener un Media por ID
 */
@Injectable()
export class GetMediaUseCase {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(id: number): Promise<Media> {
    const media = await this.mediaRepository.findById(id)
    if (!media) {
      throw new NotFoundException(`Media con ID ${id} no encontrado`)
    }
    return media
  }
}

/**
 * Use Case: Listar todos los Media con filtros y paginación
 */
@Injectable()
export class ListMediaUseCase {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(filters: MediaFilters): Promise<PaginatedMediaResult> {
    return this.mediaRepository.findAll(filters)
  }
}

