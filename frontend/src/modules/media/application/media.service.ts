import { http } from '@/infrastructure/http/http'
import type {
  PaginatedMediaResult,
  MediaItem,
  CreateMediaPayload,
  UpdateMediaPayload,
  MediaFilters,
} from './media.models'

export async function listMedia(params?: MediaFilters): Promise<PaginatedMediaResult> {
  const { admin, ...query } = params ?? {}
  const endpoint = admin ? '/media/admin/all' : '/media'
  const { data } = await http.get(endpoint, { params: query })
  return data
}

export async function getMediaById(id: number): Promise<MediaItem> {
  const { data } = await http.get(`/media/${id}`)
  return data
}

export async function createMedia(payload: CreateMediaPayload): Promise<MediaItem> {
  const formData = new FormData()
  formData.append('tipo', payload.tipo)
  formData.append('titulo', payload.titulo)
  if (payload.descripcion?.trim()) {
    formData.append('descripcion', payload.descripcion.trim())
  }
  formData.append('file', payload.file)

  try {
    const { data } = await http.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  } catch (error) {
    console.error('❌ Error al crear video:', error)
    throw error
  }
}

export async function updateMedia(id: number, payload: UpdateMediaPayload): Promise<MediaItem> {
  const formData = new FormData()
  if (payload.tipo !== undefined) formData.append('tipo', payload.tipo)
  if (payload.titulo !== undefined) formData.append('titulo', payload.titulo)
  if (payload.descripcion !== undefined) {
    formData.append('descripcion', payload.descripcion ?? '')
  }
  if (payload.file) formData.append('file', payload.file)

  const { data } = await http.patch(`/media/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function toggleMediaStatus(id: number): Promise<MediaItem> {
  const { data } = await http.patch(`/media/${id}/toggle-status`)
  return data
}

export async function deleteMedia(id: number): Promise<void> {
  await http.delete(`/media/${id}`)
}
