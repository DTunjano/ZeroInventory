/**
 * Centralized theme management system
 * Handles all theme switching logic without component dependencies
 */

export type Theme = 'light' | 'dark'

/**
 * Apply theme class to document root
 * This drives all CSS variable changes via @layer base in index.css
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.style.colorScheme = theme

  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  // Persist to localStorage
  localStorage.setItem('theme', theme)
}

/**
 * Get the current theme from DOM
 */
export function getCurrentTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

/**
 * Initialize theme on app startup
 * Checks localStorage first, then system preference, then defaults to dark
 */
export function initializeTheme(): void {
  if (typeof window === 'undefined') return

  const saved = localStorage.getItem('theme') as Theme | null

  if (saved && ['light', 'dark'].includes(saved)) {
    applyTheme(saved)
    return
  }

  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(prefersDark ? 'dark' : 'light')
}

/**
 * Toggle theme between light and dark
 */
export function toggleTheme(): Theme {
  const current = getCurrentTheme()
  const next = current === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  return next
}

/**
 * Watch for system theme changes and sync if user hasn't manually set theme
 */
export function watchSystemTheme(): () => void {
  if (typeof window === 'undefined') return () => {}

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
    // Only auto-sync if no manual theme was saved
    const saved = localStorage.getItem('theme')
    if (!saved) {
      applyTheme(e.matches ? 'dark' : 'light')
    }
  }

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }

  // Fallback for older browsers
  mediaQuery.addListener(handleChange)
  return () => mediaQuery.removeListener(handleChange)
}
