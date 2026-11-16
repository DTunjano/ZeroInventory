import { create } from 'zustand'
import { applyTheme, getCurrentTheme, initializeTheme } from '@/core/theme'
import type { Theme, UserSettings } from '../domain/settings.models'

interface SettingsState {
  theme: Theme
  settings: UserSettings | null
  isPending: boolean
  setTheme: (theme: Theme) => void
  setSettings: (settings: UserSettings | null) => void
  setPending: (isPending: boolean) => void
}

// Initialize theme from localStorage or system preference
initializeTheme()
const initialTheme = getCurrentTheme()

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: initialTheme,
  settings: null,
  isPending: false,
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
  setSettings: (settings) => {
    if (settings) {
      applyTheme(settings.theme)
    }
    set({ settings })
  },
  setPending: (isPending) => set({ isPending }),
}))
