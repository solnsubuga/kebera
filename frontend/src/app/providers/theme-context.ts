import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark' | 'system'

type ThemeState = { theme: Theme; setTheme: (theme: Theme) => void }

export const ThemeContext = createContext<ThemeState | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
