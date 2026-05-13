import { create } from 'zustand'
import type { Theme, UserSettings } from '../domain/settings.models'

interface SettingsState {
  theme: Theme
  settings: UserSettings | null
  isPending: boolean
  setTheme: (theme: Theme) => void
  setSettings: (settings: UserSettings | null) => void
  setPending: (isPending: boolean) => void
}

const saved = localStorage.getItem('theme') as Theme | null
const initialTheme: Theme = saved && ['dark', 'light'].includes(saved) ? saved : 'dark'

function applyThemeClass(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: initialTheme,
  settings: null,
  isPending: false,
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    applyThemeClass(theme)
    set({ theme })
  },
  setSettings: (settings) => {
    if (settings) {
      localStorage.setItem('theme', settings.theme)
      applyThemeClass(settings.theme)
    }
    set({ settings })
  },
  setPending: (isPending) => set({ isPending }),
}))

// Apply initial theme class
applyThemeClass(initialTheme)
