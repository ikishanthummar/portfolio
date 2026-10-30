import { useEffect, useState } from 'react'
import { Moon, Sparkles, Sun } from 'lucide-react'

// dark (Gargantua) -> galaxy (the Milky Way) -> light (the wormhole) -> dark.
// galaxy keeps the `dark` class so every dark style applies, plus `galaxy` for its own tint
export const THEMES = ['dark', 'galaxy', 'light']
export const THEME_LABELS = { dark: 'Dark mode', galaxy: 'Galaxy mode', light: 'Light mode' }
// theme buttons show the theme they switch to
export const THEME_ICONS = { dark: Moon, galaxy: Sparkles, light: Sun }
const META_COLORS = { dark: '#080808', galaxy: '#06070e', light: '#f5f5f3' }

const read = () => {
  const cl = document.documentElement.classList
  if (cl.contains('galaxy')) return 'galaxy'
  return cl.contains('dark') ? 'dark' : 'light'
}

export const nextTheme = (theme) => THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]

export function useTheme() {
  const [theme, setTheme] = useState(read)

  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(read()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const toggle = () => {
    const next = nextTheme(read())
    const cl = document.documentElement.classList
    cl.toggle('dark', next !== 'light')
    cl.toggle('galaxy', next === 'galaxy')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLORS[next])
  }

  return [theme, toggle]
}
