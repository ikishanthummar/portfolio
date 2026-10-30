import { useEffect, useState } from 'react'
import { AnimatePresence, animate, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { disableSound, enableSound } from '../lib/sound'

// Browsers only allow audio after a click, so the loader ends with a "begin" button.
export default function Preloader({ onDone }) {
  const [count, setCount] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const c = animate(0, 100, {
      duration: 1.4,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => setLoaded(true),
    })
    return () => c.stop()
  }, [])

  const enter = (withSound) => {
    if (withSound) enableSound()
    else disableSound()
    onDone()
  }

  useEffect(() => {
    if (!loaded) return
    const onKey = (e) => e.key === 'Enter' && enter(true)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loaded])

  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.03, filter: 'blur(10px)' }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[90] grid place-items-center bg-bg"
    >
      <div className="flex flex-col items-center">
        <motion.span
          initial={{ scale: 0.6, opacity: 0, borderRadius: 30 }}
          animate={{ scale: 1, opacity: 1, borderRadius: 16 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="grid h-14 w-14 place-items-center bg-fg text-base font-bold text-bg"
        >
          KT
        </motion.span>

        <div className="relative mt-7 h-24 w-56">
          <AnimatePresence mode="wait">
            {!loaded ? (
              <motion.div key="bar" exit={{ opacity: 0, y: -6 }} className="flex flex-col items-center">
                <div className="mt-3 h-1 w-40 overflow-hidden rounded-full bg-line/10">
                  <div className="h-full rounded-full bg-fg" style={{ width: `${count}%` }} />
                </div>
                <div className="mt-3 font-mono text-[11px] tabular-nums text-muted">{count}%</div>
              </motion.div>
            ) : (
              <motion.div
                key="enter"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center"
              >
                <button onClick={() => enter(true)} className="btn-solid group" autoFocus>
                  Begin mission
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
                <button onClick={() => enter(false)} className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted hover:text-fg">
                  Enter without sound
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
