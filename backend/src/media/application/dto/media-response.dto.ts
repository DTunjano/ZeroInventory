/**
 * DTO de respuesta para Media
 * Nunca expone publicId en respuestas públicas
 * Incluye solo los datos necesarios para el frontend
 */
export class MediaResponseDto {
  mediaId!: number
  titulo!: string
  descripcion!: string | null
  url!: string
  tipo!: 'video' | 'image'
  estado!: 'activo' | 'inactivo'
  orden!: number
  createdAt!: Date
  updatedAt!: Date

  /**
   * Constructor privado para evitar instanciación directa
   */
  private constructor() {}

  /**
   * Factory method para crear desde Media entity
   */
  static fromEntity(media: any): MediaResponseDto {
    const dto = new MediaResponseDto()
    dto.mediaId = media.mediaId
    dto.titulo = media.titulo
    dto.descripcion = media.descripcion
    dto.url = media.url
    dto.tipo = media.tipo
    dto.estado = media.estado
    dto.orden = media.orden
    dto.createdAt = media.createdAt
    dto.updatedAt = media.updatedAt
    return dto
  }
}

/**
 * DTO de respuesta para listado paginado
 */
export class PaginatedMediaResponseDto {
  data!: MediaResponseDto[]
  total!: number
  page!: number
  limit!: number
  totalPages!: number

  private constructor() {}

  static fromResult(result: any): PaginatedMediaResponseDto {
    const dto = new PaginatedMediaResponseDto()
    dto.data = result.data.map((m: any) => MediaResponseDto.fromEntity(m))
    dto.total = result.total
    dto.page = result.page
    dto.limit = result.limit
    dto.totalPages = result.totalPages
    return dto
  }
}
