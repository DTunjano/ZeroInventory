import { useQuery } from '@tanstack/react-query'
import { listMedia } from '@/modules/media/application/media.service'
import type { MediaItem } from '@/modules/media/application/media.models'

/**
 * Hook: Obtener video activo para hero section
 * - Obtiene el primer video activo
 * - Sin requiere autenticación (público)
 */
export function useHeroVideo() {
  return useQuery({
    queryKey: ['media', 'hero', 'active'],
    queryFn: async () => {
      try {
        const result = await listMedia({
          page: 1,
          limit: 1,
          tipo: 'video',
          estado: 'activo',
          admin: false,
        })
        return result.data[0] || null
      } catch {
        return null
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
  })
}

/**
 * Hook: Obtener todos los videos activos
 * - Para mostrar galería si es necesario
 */
export function useActiveMediaList() {
  return useQuery({
    queryKey: ['media', 'active', 'list'],
    queryFn: async () => {
      try {
        const result = await listMedia({
          page: 1,
          limit: 10,
          estado: 'activo',
          admin: false,
        })
        return result.data
      } catch {
        return []
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  })
}
