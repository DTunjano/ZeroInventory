import { useEffect } from 'react'

import { useAuthStore } from '../application/auth.store'

export function AuthBootstrap() {
  const status = useAuthStore((s) => s.status)
  const refresh = useAuthStore((s) => s.refresh)

  useEffect(() => {
    if (status === 'unknown') {
      void refresh()
    }
  }, [status, refresh])

  return null
}
