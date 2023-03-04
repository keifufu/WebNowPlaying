import { createSignal } from 'solid-js'
import { useMediaQuery } from 'solid-use'

// If the theme has been set, it's stored in localStorage and used from there on
// otherwise, it's set to the system theme
const isSystemDark = useMediaQuery('(prefers-color-scheme: dark)')
const [theme, _setTheme] = createSignal<'dark' | 'light' | 'konami'>(localStorage.getItem('theme') ? localStorage.getItem('theme') as 'dark' | 'light' | 'konami' : isSystemDark() ? 'dark' : 'light')
const [borderColorClass, setBorderColorClass] = createSignal<'border-zinc-500' | 'border-zinc-300'>(localStorage.getItem('theme') === 'konami' ? 'border-zinc-300' : 'border-zinc-500')
export const useBorderColorClass = () => borderColorClass
const setTheme = (theme: 'dark' | 'light' | 'konami') => {
  localStorage.setItem('theme', theme)
  _setTheme(theme)
  if (theme === 'konami') setBorderColorClass('border-zinc-300')
  else setBorderColorClass('border-zinc-500')
}
export const useTheme = () => ({ theme, setTheme })