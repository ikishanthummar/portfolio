import { useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useMotionValueEvent, useScroll } from 'framer-motion'
import { scrollToId } from '../lib/scroll'
import { playDocking } from '../lib/sound'

const MODULES = 12
const RING = 33

// Top-down Endurance: twelve modules on a ring, four spokes, docking hub in the middle.
// Modules light up one by one as you scroll down the page.
function Endurance({ lit, rotate }) {
  return (
    <svg viewBox="-50 -50 100 100" className="h-full w-full" aria-hidden="true">
      <motion.g style={{ rotate }}>
        <circle r={RING} fill="none" stroke="rgb(var(--fg) / 0.35)" strokeWidth="1.4" />
        {[45, 135, 225, 315].map((a) => (
          <line
            key={a}
            x1={Math.cos((a * Math.PI) / 180) * 7}
            y1={Math.sin((a * Math.PI) / 180) * 7}
            x2={Math.cos((a * Math.PI) / 180) * (RING - 4)}
            y2={Math.sin((a * Math.PI) / 180) * (RING - 4)}
            stroke="rgb(var(--fg) / 0.45)"
            strokeWidth="1.2"
          />
        ))}
        {Array.from({ length: MODULES }, (_, i) => {
          const angle = (i / MODULES) * 360
          const on = i < lit
          return (
            <rect
              key={i}
              x={-6}
              y={-4}
              width={12}
              height={8}
              rx={1.5}
              transform={`rotate(${angle}) translate(0 ${-RING}) `}
              fill={on ? 'rgb(var(--fg))' : 'rgb(var(--bg))'}
              stroke="rgb(var(--fg) / 0.8)"
              strokeWidth="1.1"
              style={{ transition: 'fill 0.4s' }}
            />
          )
        })}
        <circle r="8" fill="rgb(var(--fg))" />
        <circle r="3.2" fill="rgb(var(--bg))" />
      </motion.g>
    </svg>
  )
}

export default function EnduranceTop() {
  const { scrollY, scrollYProgress } = useScroll()
  const [visible, setVisible] = useState(false)
  const [lit, setLit] = useState(0)
  const [docking, setDocking] = useState(false)
  const [pulse, setPulse] = useState(0)
  const rotate = useMotionValue(0)
  const speed = useRef(8)
  const hover = useRef(false)

  useMotionValueEvent(scrollY, 'change', (v) => setVisible(v > window.innerHeight * 0.8))
  useMotionValueEvent(scrollYProgress, 'change', (v) => setLit(Math.round(v * MODULES)))

  // degrees per second: slow drift, faster on hover, a hard spin while docking
  useAnimationFrame((_, delta) => {
    const target = docking ? 900 : hover.current ? 60 : 8
    speed.current += (target - speed.current) * Math.min(1, delta / (docking ? 120 : 400))
    rotate.set((rotate.get() + (speed.current * delta) / 1000) % 360)
  })

  const dock = () => {
    if (docking) return
    setDocking(true)
    setPulse((n) => n + 1)
    playDocking()
    scrollToId('top')
    setTimeout(() => setDocking(false), 1400)
  }

  return (
    <AnimatePresence>
      {(visible || docking) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          className="fixed bottom-5 right-4 z-[60] sm:bottom-6 sm:right-6"
        >
          <button
            onClick={dock}
            onMouseEnter={() => (hover.current = true)}
            onMouseLeave={() => (hover.current = false)}
            aria-label="Back to top"
            data-cursor="Dock"
            className="relative grid h-16 w-16 place-items-center rounded-full bg-bg/50 p-1.5 backdrop-blur-md"
          >
            <AnimatePresence>
              {pulse > 0 && (
                <motion.span
                  key={pulse}
                  initial={{ scale: 0.8, opacity: 0.7 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="pointer-events-none absolute inset-0 rounded-full border border-fg/50"
                />
              )}
            </AnimatePresence>
            <Endurance lit={lit} rotate={rotate} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
