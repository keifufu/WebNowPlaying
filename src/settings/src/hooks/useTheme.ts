import { createSignal } from 'solid-js'
import { useMediaQuery } from 'solid-use'

// If the theme has been set, it's stored in localStorage and used from there on
// otherwise, it's set to the system theme
const isSystemDark = useMediaQuery('(prefers-color-scheme: dark)')
const [theme, setTheme] = createSignal<'dark' | 'light'>(localStorage.getItem('theme') ? localStorage.getItem('theme') as 'dark' | 'light' : isSystemDark() ? 'dark' : 'light')
const toggleTheme = () => {
  const newTheme = theme() === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', newTheme)
  setTheme(newTheme)
}
export const useTheme = () => ({ theme, toggleTheme })