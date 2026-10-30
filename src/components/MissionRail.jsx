import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { scrollToId } from '../lib/scroll'
import { cameraAt, distUnit, sceneFor } from '../lib/journey'
import { useTheme } from '../lib/theme'
import { ease } from './ui'
import { Earth, Edmunds, Gargantua, Mann, Miller } from './Planets'

// each section is a stop on the Endurance's route, ending at Gargantua
const STOPS = [
  { id: 'top', name: 'Home', phase: 'Earth', Planet: Earth, glow: '#5aa9ff' },
  { id: 'skills', name: 'Skills', phase: 'Miller', Planet: Miller, glow: '#3fd1c9' },
  { id: 'experience', name: 'Experience', phase: 'Mann', Planet: Mann, glow: '#b8d4ea' },
  { id: 'work', name: 'Work', phase: 'Edmunds', Planet: Edmunds, glow: '#f0a050' },
  { id: 'contact', name: 'Contact', phase: 'Gargantua', Planet: Gargantua, glow: '#ffb36b' },
]

// planet icon with state: dimmed ahead of you, lit once reached, glowing when current
function Stop({ stop, passed, current, size }) {
  const { Planet, glow } = stop
  return (
    <span
      className="relative z-10 grid shrink-0 place-items-center transition-all duration-500"
      style={{
        width: size + 4,
        height: size + 4,
        opacity: passed ? 1 : 0.45,
        transform: `scale(${current ? 1.2 : passed ? 1 : 0.85})`,
        filter: current ? `drop-shadow(0 0 6px ${glow})` : passed ? 'none' : 'grayscale(0.6)',
      }}
    >
      <Planet size={size} />
    </span>
  )
}
const LAST = STOPS.length - 1
// only very wide screens have room to keep the current label visible next to the content
const WIDE = typeof window !== 'undefined' && window.matchMedia('(min-width: 1536px)').matches

// Where each section starts (as a scroll position), and where the marker is between them.
function useTrajectory(scene) {
  const { scrollY } = useScroll()
  const marker = useMotionValue(0)
  const [active, setActive] = useState(0)
  const [distances, setDistances] = useState(STOPS.map(() => 24))
  const offsets = useRef(STOPS.map(() => 0))

  const update = (y) => {
    const o = offsets.current
    let i = 0
    while (i < LAST - 1 && y >= o[i + 1]) i++
    const t = Math.min(1, Math.max(0, (y - o[i]) / Math.max(1, o[i + 1] - o[i])))
    marker.set((i + t) / LAST)
    setActive(Math.min(LAST, i + (t > 0.5 ? 1 : 0)))
  }

  useEffect(() => {
    const measure = () => {
      const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      offsets.current = STOPS.map((s) => {
        const el = document.getElementById(s.id)
        return el ? Math.min(range, el.getBoundingClientRect().top + window.scrollY) : 0
      })
      setDistances(offsets.current.map((o) => cameraAt(o / range, scene).dist))
      update(window.scrollY)
    }
    measure()
    // page height changes as sections reveal / reflow; re-measure after resizes settle too
    const ro = new ResizeObserver(measure)
    ro.observe(document.documentElement)
    let timer
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(measure, 250)
    }
    window.addEventListener('resize', onResize)
    return () => {
      ro.disconnect()
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [scene])

  useMotionValueEvent(scrollY, 'change', update)
  return { marker, active, distances }
}

function Marker({ vertical }) {
  return (
    <span className="relative grid place-items-center">
      <span
        className={`absolute from-[#ffd9a8] to-transparent ${
          vertical ? 'bottom-1/2 h-8 w-px bg-gradient-to-t' : 'right-1/2 h-px w-8 bg-gradient-to-l'
        }`}
      />
      <span className="h-2.5 w-2.5 rounded-full bg-[#ffe6c4] shadow-[0_0_10px_2px_rgba(255,190,120,0.65)]" />
    </span>
  )
}

export default function MissionRail({ ready }) {
  const [theme] = useTheme()
  const scene = sceneFor(theme)
  const unit = distUnit(scene)
  const { marker, active, distances } = useTrajectory(scene)
  const [open, setOpen] = useState(false)
  const percent = useTransform(marker, (v) => `${v * 100}%`)

  return (
    <>
      {/* desktop: vertical trajectory on the left */}
      <div className="pointer-events-none fixed inset-y-0 left-0 z-[60] hidden items-center pl-5 md:flex lg:pl-7">
        <motion.nav
          aria-label="Sections"
          initial={{ opacity: 0, x: -20 }}
          animate={ready ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, delay: 0.6, ease }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className={`pointer-events-auto relative -ml-3 rounded-2xl border py-3 pl-3 pr-6 transition-colors duration-300 ${
            open ? 'border-line/10 bg-bg/80 backdrop-blur-xl' : 'border-transparent'
          }`}
        >
          <div className={`mb-4 font-mono text-[9px] uppercase tracking-[0.25em] text-muted transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}>
            Trajectory
          </div>
          <div className="relative h-[300px] w-[22px]">
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-line/15" />
            <motion.span style={{ height: percent }} className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-fg/60" />

            <motion.span style={{ top: percent }} className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Marker vertical />
            </motion.span>

            {STOPS.map((s, i) => {
              const showLabel = open || (WIDE && i === active)
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToId(s.id)}
                  aria-label={s.name}
                  aria-current={i === active ? 'true' : undefined}
                  className="absolute left-0 flex -translate-y-1/2 items-center gap-3 rounded-full py-1 pr-2"
                  style={{ top: `${(i / LAST) * 100}%` }}
                >
                  <Stop stop={s} passed={i <= active} current={i === active} size={18} />
                  <motion.span
                    initial={false}
                    animate={{ opacity: showLabel ? 1 : 0, x: showLabel ? 0 : -6 }}
                    transition={{ duration: 0.3, delay: open ? i * 0.04 : 0 }}
                    className="pointer-events-none whitespace-nowrap text-left"
                  >
                    <span className={`block text-[13px] font-medium leading-tight ${i === active ? 'text-fg' : 'text-fg/70'}`}>{s.name}</span>
                    <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                      {s.phase} · {distances[i].toFixed(1)} {unit}
                    </span>
                  </motion.span>
                </button>
              )
            })}
          </div>
        </motion.nav>
      </div>

      {/* mobile: compact horizontal trajectory, bottom left */}
      <div className="pointer-events-none fixed bottom-5 left-4 z-[60] md:hidden">
        <motion.nav
          aria-label="Sections"
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.6, ease }}
          className="pointer-events-auto w-[220px] rounded-2xl border border-line/10 bg-bg/60 px-4 pb-3 pt-2.5 backdrop-blur-xl"
        >
          <div className="mb-2.5 flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.14em]">
            <span className="whitespace-nowrap text-fg">{STOPS[active].name}</span>
            <span className="whitespace-nowrap text-muted">
              {STOPS[active].phase} · {distances[active].toFixed(1)} {unit}
            </span>
          </div>
          <div className="relative h-6">
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line/15" />
            <motion.span style={{ width: percent }} className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-fg/60" />
            <motion.span style={{ left: percent }} className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Marker />
            </motion.span>
            {STOPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => scrollToId(s.id)}
                aria-label={s.name}
                className="absolute top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center"
                style={{ left: `${(i / LAST) * 100}%` }}
              >
                <Stop stop={s} passed={i <= active} current={i === active} size={14} />
              </button>
            ))}
          </div>
        </motion.nav>
      </div>
    </>
  )
}
