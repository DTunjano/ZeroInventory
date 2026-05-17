import { Media, MediaTipo, MediaEstado } from './media.models'

export interface MediaFilters {
  tipo?: MediaTipo
  estado?: MediaEstado
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedMediaResult {
  data: Media[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Repository abstraction para Media
 * Define operaciones del repositorio sin detalles de implementación
 */
export abstract class MediaRepository {
  /**
   * Obtener todos los media con filtros y paginación
   */
  abstract findAll(filters?: MediaFilters): Promise<PaginatedMediaResult>

  /**
   * Obtener media por ID
   */
  abstract findById(id: number): Promise<Media | null>

  /**
   * Obtener todos los media por tipo
   */
  abstract findByTipo(tipo: MediaTipo): Promise<Media[]>

  /**
   * Guardar nuevo media
   */
  abstract save(media: Media): Promise<Media>

  /**
   * Actualizar media existente
   */
  abstract update(id: number, media: Partial<Media>): Promise<Media>

  /**
   * Eliminar media (soft delete - marcar como inactivo)
   */
  abstract delete(id: number): Promise<void>

  /**
   * Cambiar estado del media
   */
  abstract toggleEstado(id: number): Promise<Media>
}
