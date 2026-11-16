export type MediaTipo = 'video' | 'image'
export type MediaEstado = 'activo' | 'inactivo'

export interface MediaItem {
  mediaId: number
  tipo: MediaTipo
  titulo: string
  descripcion: string | null
  url: string
  estado: MediaEstado
  orden: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedMediaResult {
  data: MediaItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface MediaFilters {
  search?: string
  tipo?: MediaTipo
  estado?: MediaEstado
  page?: number
  limit?: number
  admin?: boolean
}

export interface CreateMediaPayload {
  tipo: MediaTipo
  titulo: string
  descripcion?: string
  file: File
}

export interface UpdateMediaPayload {
  tipo?: MediaTipo
  titulo?: string
  descripcion?: string | null
  file?: File | null
}
