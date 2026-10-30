import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'

export const ease = [0.16, 1, 0.3, 1]

export function Reveal({ children, delay = 0, y = 24, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*<>/'

export function Scramble({ text, className = '', delay = 0, speed = 28, start }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const go = start === undefined ? inView : start && inView
  const [out, setOut] = useState(() => text.replace(/\S/g, ' '))

  useEffect(() => {
    if (!go) return
    let raf
    let t0
    const tick = (now) => {
      t0 ??= now + delay * 1000
      const elapsed = now - t0
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick)
        return
      }
      const revealed = Math.floor(elapsed / speed)
      let s = ''
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ' || i < revealed) s += text[i]
        else if (i < revealed + 6) s += GLYPHS[(Math.random() * GLYPHS.length) | 0]
        else s += ' '
      }
      setOut(s)
      if (revealed < text.length) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [go, text, delay, speed])

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </span>
  )
}

export function SectionHeading({ label, title, shine, subtitle }) {
  return (
    <div className="mb-8 max-w-2xl sm:mb-10">
      <Reveal>
        <span className="label">{label}</span>
      </Reveal>
      <h2 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-[-0.03em] sm:text-[2.6rem]">
        <Scramble text={title} /> {shine && <span className="text-shine">{shine}</span>}
      </h2>
      {subtitle && (
        <Reveal delay={0.1}>
          <p className="mt-3 text-[15px] leading-relaxed text-fg/70">{subtitle}</p>
        </Reveal>
      )}
    </div>
  )
}

export function Tile({ as: Tag = 'div', className = '', children, ...rest }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <Tag onMouseMove={onMove} className={`tile spot ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export function BorderBeam() {
  return <span aria-hidden="true" className="beam pointer-events-none absolute inset-0 rounded-[inherit]" />
}

export function Magnetic({ children, strength = 0.25, className = '' }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 14, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 180, damping: 14, mass: 0.4 })
  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * strength)
        y.set((e.clientY - r.top - r.height / 2) * strength)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function useLocalTime() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date())
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 10000)
    return () => clearInterval(id)
  }, [])
  return time
}

export function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  )
}

export function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}
