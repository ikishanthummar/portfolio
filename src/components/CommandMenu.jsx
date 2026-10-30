import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Copy, CornerDownLeft, Download, Mail, Search, Volume2, VolumeX } from 'lucide-react'
import { profile } from '../data'
import { scrollToId, startScroll, stopScroll } from '../lib/scroll'
import { THEME_ICONS, THEME_LABELS, nextTheme, useTheme } from '../lib/theme'
import { useSound } from '../lib/sound'
import { GithubIcon, LinkedinIcon, ease } from './ui'
import { Earth, Edmunds, Gargantua, Mann, Miller } from './Planets'

export default function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const [toast, setToast] = useState('')
  const [theme, toggleTheme] = useTheme()
  const [soundOn, toggleSound] = useSound()
  const input = useRef(null)

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 1800)
  }

  const actions = useMemo(
    () => [
      { group: 'Navigate', label: 'Home', Icon: Earth, run: () => scrollToId('top') },
      { group: 'Navigate', label: 'Skills', Icon: Miller, run: () => scrollToId('skills') },
      { group: 'Navigate', label: 'Experience', Icon: Mann, run: () => scrollToId('experience') },
      { group: 'Navigate', label: 'Work', Icon: Edmunds, run: () => scrollToId('work') },
      { group: 'Navigate', label: 'Contact', Icon: Gargantua, run: () => scrollToId('contact') },
      {
        group: 'Actions',
        label: 'Copy email address',
        Icon: Copy,
        run: async () => {
          try {
            await navigator.clipboard.writeText(profile.email)
            notify('Email copied')
          } catch (e) {}
        },
      },
      {
        group: 'Actions',
        label: 'Download resume',
        Icon: Download,
        run: () => {
          const a = document.createElement('a')
          a.href = profile.cv
          a.download = ''
          a.click()
        },
      },
      { group: 'Actions', label: `Switch to ${THEME_LABELS[nextTheme(theme)].toLowerCase()}`, Icon: THEME_ICONS[nextTheme(theme)], run: toggleTheme },
      { group: 'Actions', label: soundOn ? 'Turn sound off' : 'Turn sound on', Icon: soundOn ? VolumeX : Volume2, run: toggleSound },
      { group: 'Links', label: 'Send an email', Icon: Mail, run: () => (window.location.href = `mailto:${profile.email}`) },
      { group: 'Links', label: 'GitHub', Icon: GithubIcon, run: () => window.open(profile.github, '_blank', 'noopener') },
      { group: 'Links', label: 'LinkedIn', Icon: LinkedinIcon, run: () => window.open(profile.linkedin, '_blank', 'noopener') },
    ],
    [theme, toggleTheme, soundOn, toggleSound],
  )

  const results = actions.filter((a) => a.label.toLowerCase().includes(query.trim().toLowerCase()))

  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('cmdk:open', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('cmdk:open', onOpen)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    stopScroll()
    setQuery('')
    setIndex(0)
    setTimeout(() => input.current?.focus(), 50)
    return () => startScroll()
  }, [open])

  const run = (a) => {
    setOpen(false)
    setTimeout(a.run, 120)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[index]) {
      run(results[index])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  let lastGroup = null

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[14vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div onClick={() => setOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command menu"
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -6 }}
              transition={{ duration: 0.3, ease }}
              className="tile glass-blur relative w-full max-w-lg overflow-hidden rounded-[22px] bg-surface/90"
            >
              <div className="flex items-center gap-3 border-b border-line/[0.07] px-4 py-3.5">
                <Search size={17} className="text-muted" />
                <input
                  ref={input}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setIndex(0)
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="Type a command or search…"
                  className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
                />
                <kbd className="rounded-md border border-line/10 px-1.5 py-0.5 font-mono text-[10px] text-muted">ESC</kbd>
              </div>
              <div data-lenis-prevent className="max-h-[52vh] overflow-y-auto p-2">
                {results.length === 0 && <div className="px-3 py-8 text-center text-sm text-muted">No results</div>}
                {results.map((a, i) => {
                  const header = a.group !== lastGroup
                  lastGroup = a.group
                  const Icon = a.Icon
                  return (
                    <div key={a.label}>
                      {header && <div className="label px-3 pb-1.5 pt-3">{a.group}</div>}
                      <button
                        onClick={() => run(a)}
                        onMouseMove={() => setIndex(i)}
                        data-stick
                        className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm"
                      >
                        {index === i && (
                          <motion.span layoutId="cmdk-active" className="absolute inset-0 rounded-xl bg-line/[0.07]" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
                        )}
                        <span className="squircle relative h-8 w-8 rounded-[9px]">
                          <Icon className="h-[15px] w-[15px]" size={15} />
                        </span>
                        <span className="relative flex-1">{a.label}</span>
                        {index === i && <CornerDownLeft size={14} className="relative text-muted" />}
                      </button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[95] flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="tile rounded-full px-4 py-2 text-sm font-medium"
          >
            {toast} ✓
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
