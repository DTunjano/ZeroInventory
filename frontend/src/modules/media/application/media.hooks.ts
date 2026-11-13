import { useQuery } from '@tanstack/react-query'
import { listMedia } from './media.service'

export function useStoreHeroVideo() {
  return useQuery({
    queryKey: ['media', 'hero-video'],
    queryFn: async () => {
      try {
        const result = await listMedia({ tipo: 'video', estado: 'activo', limit: 1, page: 1 })
        return result.data[0] ?? null
      } catch {
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}
