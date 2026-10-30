import { motion, useScroll, useTransform } from 'framer-motion'
import { Command, Download, VolumeX } from 'lucide-react'
import { profile } from '../data'
import { cameraAt, dilationAt, distUnit, formatDilation, sceneFor } from '../lib/journey'
import { openCommandMenu } from '../lib/scroll'
import { useSound } from '../lib/sound'
import { THEME_ICONS, THEME_LABELS, nextTheme, useTheme } from '../lib/theme'
import { ease } from './ui'

function SoundBars() {
  return (
    <span className="flex h-3.5 items-end gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="eq-bar w-[2.5px] rounded-full bg-current" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  )
}

const btn = 'grid h-8 w-8 place-items-center rounded-lg text-fg/75 transition-colors hover:bg-line/10 hover:text-fg'

function Readout({ scene }) {
  const { scrollY, scrollYProgress } = useScroll()
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const opacity = useTransform(scrollY, [vh * 0.7, vh], [0, 1])
  const dist = useTransform(scrollYProgress, (v) => cameraAt(v, scene).dist.toFixed(2))
  const dilation = useTransform(scrollYProgress, (v) => formatDilation(dilationAt(v)))

  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className="pointer-events-none hidden items-center gap-3 rounded-xl border border-line/10 bg-bg/50 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted backdrop-blur-xl lg:flex"
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ffd9a8]" />
      <span>
        Dist <motion.span className="text-fg">{dist}</motion.span> {distUnit(scene)}
      </span>
      <span className="h-3 w-px bg-line/15" />
      {scene !== 'blackhole' ? (
        <span>
          Dest <span className="text-fg">{scene === 'galaxy' ? 'Sol' : 'Gargantua'}</span>
        </span>
      ) : (
        <span>
          1h = <motion.span className="text-fg">{dilation}</motion.span>
        </span>
      )}
    </motion.div>
  )
}

// top-right HUD: live readout + sound / theme / search / resume
export default function ControlDeck({ ready }) {
  const [sound, toggleSound] = useSound()
  const [theme, toggleTheme] = useTheme()
  const scene = sceneFor(theme)
  const next = nextTheme(theme)
  const ThemeIcon = THEME_ICONS[next]

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={ready ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay: 0.4, ease }}
      className="fixed right-4 top-4 z-[60] flex items-center gap-2 sm:right-6 sm:top-5"
    >
      <Readout key={scene} scene={scene} />

      <div className="flex items-center gap-0.5 rounded-xl border border-line/10 bg-bg/50 p-1 backdrop-blur-xl">
        <button onClick={toggleSound} data-sound-toggle aria-pressed={sound} aria-label={sound ? 'Sound off' : 'Sound on'} title={sound ? 'Sound off' : 'Sound on'} className={btn}>
          {sound ? <SoundBars /> : <VolumeX size={16} strokeWidth={1.8} />}
        </button>
        <button onClick={toggleTheme} aria-label={THEME_LABELS[next]} title={THEME_LABELS[next]} className={btn}>
          <ThemeIcon size={16} strokeWidth={1.8} />
        </button>
        <button onClick={openCommandMenu} aria-label="Search (Ctrl K)" title="Search (Ctrl K)" className={`${btn} hidden sm:grid`}>
          <Command size={16} strokeWidth={1.8} />
        </button>
        <a href={profile.cv} download aria-label="Download resume" title="Download resume" className={btn}>
          <Download size={16} strokeWidth={1.8} />
        </a>
      </div>
    </motion.div>
  )
}
