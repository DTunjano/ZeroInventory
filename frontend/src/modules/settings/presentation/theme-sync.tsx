import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/modules/auth/application/auth.store'
import { useSettingsStore } from '../application/settings.store'
import { settingsService } from '../infrastructure/settings.service'

/** Restores the authenticated account's preference after login or reload. */
export function ThemeSync() {
  const userId = useAuthStore((state) => state.user?.usuarioId)
  const status = useAuthStore((state) => state.status)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const query = useQuery({
    queryKey: ['settings', userId, 'appearance'],
    queryFn: () => settingsService.getAppearance(),
    enabled: !!userId && status === 'authenticated',
    staleTime: 60_000,
  })
  useEffect(() => {
    if (query.data?.theme === 'light' || query.data?.theme === 'dark') setTheme(query.data.theme)
  }, [query.data?.theme, setTheme])
  return null
}
