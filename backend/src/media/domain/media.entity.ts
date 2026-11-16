/**
 * Entity Alias: Mantener por compatibilidad
 * Usar Media desde media.models.ts para el dominio
 */
import { Media } from './media.models'

export type MediaEntity = Media
export type MediaTipo = 'video' | 'image'
export type MediaEstado = 'activo' | 'inactivo'
