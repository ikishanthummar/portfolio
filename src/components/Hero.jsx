import { useEffect, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue, useScroll, useTransform } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, Check, GraduationCap, MapPin } from 'lucide-react'
import { education, experience, profile, techStack } from '../data'
import { scrollToId } from '../lib/scroll'
import { pointer } from '../lib/pointer'
import { cameraAt, dilationAt, distUnit, formatDilation, sceneFor } from '../lib/journey'
import { useTheme } from '../lib/theme'
import { BorderBeam, GithubIcon, LinkedinIcon, Magnetic, Scramble, Tile, ease, useLocalTime } from './ui'

function Bracket({ className }) {
  return <span aria-hidden="true" className={`pointer-events-none absolute h-5 w-5 border-fg/30 ${className}`} />
}

function Hud({ progress, ready, scene }) {
  const wormhole = scene === 'wormhole'
  const galaxy = scene === 'galaxy'
  const yaw = useMotionValue('+00.0')
  const pitch = useMotionValue('+00.0')
  useAnimationFrame(() => {
    const f = (v) => `${v >= 0 ? '+' : '-'}${Math.abs(v).toFixed(1).padStart(4, '0')}`
    const cam = cameraAt(progress.get(), scene)
    yaw.set(f(((cam.yaw + pointer.x * 0.3) * 180) / Math.PI))
    pitch.set(f(((cam.pitch + pointer.y * 0.08) * 180) / Math.PI))
  })
  const dist = useTransform(progress, (v) => cameraAt(v, scene).dist.toFixed(2))
  const dilation = useTransform(progress, (v) => formatDilation(dilationAt(v)))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={ready ? { opacity: 1 } : {}}
      transition={{ duration: 1.2, delay: 0.4 }}
      className="pointer-events-none absolute inset-0 font-mono text-[10px] uppercase tracking-[0.18em] text-muted"
    >
      <Bracket className="left-0 top-0 rounded-tl-lg border-l border-t" />
      <Bracket className="right-0 top-0 rounded-tr-lg border-r border-t" />
      <Bracket className="bottom-0 left-0 rounded-bl-lg border-b border-l" />
      <Bracket className="bottom-0 right-0 rounded-br-lg border-b border-r" />

      <div className="absolute left-4 top-4 space-y-1 sm:left-5 sm:top-5">
        <div className="text-fg/85">{galaxy ? 'Milky Way' : wormhole ? 'Wormhole' : 'Gargantua'}</div>
        <div>{galaxy ? 'Barred spiral · 100,000 ly' : wormhole ? 'Near Saturn' : 'SMBH · 1×10⁸ M☉'}</div>
      </div>

      <div className="absolute right-4 top-4 space-y-1 text-right sm:right-5 sm:top-5">
        <div>
          Dist <motion.span className="text-fg/85">{dist}</motion.span> {distUnit(scene)}
        </div>
        <div className="hidden sm:block">
          POV <motion.span className="text-fg/85">{yaw}</motion.span>° <motion.span className="text-fg/85">{pitch}</motion.span>°
        </div>
      </div>

      <div className="absolute bottom-4 right-4 hidden text-right sm:bottom-5 sm:right-5 lg:block">
        {galaxy ? (
          <>
            <div>Destination</div>
            <div className="mt-1 text-[13px] normal-case tracking-normal text-fg/80">
              Down through the arms to <span className="font-semibold text-fg">home, the Sun</span>
            </div>
          </>
        ) : wormhole ? (
          <>
            <div>Destination</div>
            <div className="mt-1 text-[13px] normal-case tracking-normal text-fg/80">
              Through the throat to the <span className="font-semibold text-fg">Gargantua system</span>
            </div>
          </>
        ) : (
          <>
            <div>Time dilation</div>
            <div className="mt-1 text-[13px] normal-case tracking-normal text-fg/80">
              1 hour here = <motion.span className="font-semibold text-fg">{dilation}</motion.span> on Earth
            </div>
          </>
        )}
        <div className="mt-3 text-fg/60">Scroll to travel ↓</div>
      </div>
    </motion.div>
  )
}

const lifecycle = ['Payment initiated', 'Gateway verified', 'Webhook received', 'Reconciled']

function Lifecycle() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % (lifecycle.length + 2)), 900)
    return () => clearInterval(id)
  }, [])
  return (
    <ul className="mt-4 space-y-2">
      {lifecycle.map((label, i) => {
        const done = step > i
        return (
          <li key={label} className="flex items-center gap-3 text-sm">
            <motion.span
              animate={{ scale: done ? [0.6, 1.15, 1] : 1 }}
              transition={{ duration: 0.35 }}
              className={`grid h-5 w-5 place-items-center rounded-full border transition-colors duration-300 ${
                done ? 'border-ios bg-ios text-white' : 'border-line/15 text-transparent'
              }`}
            >
              <Check size={12} strokeWidth={3} />
            </motion.span>
            <span className={`transition-colors duration-300 ${done ? 'text-fg' : 'text-muted'}`}>{label}</span>
          </li>
        )
      })}
    </ul>
  )
}

function StackMarquee() {
  const row = [...techStack, ...techStack]
  return (
    <div className="space-y-2 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      {[0, 1].map((r) => (
        <div key={r} className={`flex w-max gap-2 ${r ? 'animate-[marquee_45s_linear_infinite_reverse]' : 'animate-marquee'}`}>
          {(r ? [...row].reverse() : row).map((t, i) => (
            <span key={i} className="chip whitespace-nowrap py-1.5">
              {t}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function Hero({ ready }) {
  const time = useLocalTime()
  const current = experience[0]
  const { scrollYProgress } = useScroll()
  const [theme] = useTheme()
  const scene = sceneFor(theme)

  const fade = (i) => ({
    initial: { opacity: 0, y: 24, filter: 'blur(8px)' },
    animate: ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {},
    transition: { duration: 1, delay: 0.15 + i * 0.08, ease },
  })

  return (
    <>
      <section id="top" className="relative flex min-h-[100svh] flex-col">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-bg/90 via-bg/40 to-transparent" />
        <div className="wrap relative flex flex-1 flex-col pb-24 pt-5 sm:pb-28 sm:pt-6">
          <motion.header {...fade(0)} className="flex items-center justify-between px-1">
            <button onClick={() => scrollToId('top')} className="flex items-center gap-2.5 rounded-full pr-2">
              <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-fg text-[11px] font-bold text-bg">KT</span>
              <span className="text-sm font-semibold tracking-tight">{profile.name}</span>
            </button>
          </motion.header>

          <div className="relative mt-5 flex flex-1 flex-col justify-end p-5 sm:p-8">
            <Hud key={scene} progress={scrollYProgress} ready={ready} scene={scene} />
            <div className="relative max-w-xl">
              <motion.span {...fade(1)} className="inline-flex items-center gap-2 rounded-full border border-line/15 bg-line/[0.08] px-3 py-1 text-xs font-medium backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ios opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-ios" />
                </span>
                Available for work
              </motion.span>
              <h1 className="mt-4 text-[2.6rem] font-semibold leading-none tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                <Scramble text={profile.name} start={ready} delay={0.5} speed={45} />
              </h1>
              <motion.p {...fade(2)} className="mt-4 max-w-md text-[15px] leading-relaxed text-fg/70 sm:text-base">
                Full Stack Developer. I build secure payment platforms and scalable products with .NET, Angular and React.
              </motion.p>
              <motion.div {...fade(3)} className="mt-7 flex flex-wrap items-center gap-2.5">
                <Magnetic>
                  <button onClick={() => scrollToId('work')} className="btn-solid">
                    View work <ArrowDownRight size={16} />
                  </button>
                </Magnetic>
                <Magnetic>
                  <a href={profile.cv} download className="btn-soft">
                    Resume
                  </a>
                </Magnetic>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section id="overview" className="wrap py-10">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Tile className="p-6 md:col-span-2">
            <span className="label">About</span>
            <p className="mt-3 text-[15px] leading-relaxed text-fg/85">{profile.about}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {['Payments', 'Webhooks', 'Clean Architecture', 'JWT Auth', 'CI/CD'].map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </Tile>

          <Tile className="flex min-h-[180px] flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="label">Local time</span>
              <MapPin size={15} className="text-muted" />
            </div>
            <div>
              <div className="text-4xl font-semibold tabular-nums tracking-[-0.04em]">{time.replace(/\s?[ap]m/i, '')}</div>
              <div className="mt-1 text-sm text-muted">
                {/pm/i.test(time) ? 'PM' : 'AM'} · {profile.location} · IST
              </div>
            </div>
          </Tile>

          <Tile className="flex min-h-[180px] flex-col justify-between p-5">
            <span className="label">Experience</span>
            <div>
              <div className="text-5xl font-semibold tracking-[-0.05em]">
                6.2<span className="text-muted">+</span>
              </div>
              <div className="mt-1 text-sm text-muted">Years shipping production software across 4 companies</div>
            </div>
          </Tile>

          <Tile className="beam overflow-hidden p-6 md:col-span-2">
            <BorderBeam />
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="label">Currently</span>
                <div className="mt-2 text-lg font-semibold tracking-tight">{current.company}</div>
                <div className="text-sm text-muted">{current.role}</div>
              </div>
              <span className="rounded-full bg-ios/15 px-2.5 py-1 text-[11px] font-semibold text-ios">Now</span>
            </div>
            <Lifecycle />
          </Tile>

          <Tile className="overflow-hidden py-6 md:col-span-2">
            <span className="label px-6">Stack</span>
            <div className="mt-4">
              <StackMarquee />
            </div>
          </Tile>

          <Tile className="flex flex-col justify-between gap-6 p-5 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="label">Education</span>
              <GraduationCap size={16} className="text-muted" />
            </div>
            <div>
              <div className="text-lg font-semibold leading-tight tracking-tight">{education.degree}</div>
              <div className="mt-1 text-sm text-muted">
                {education.period} · {education.grade}
              </div>
            </div>
          </Tile>

          <div className="grid grid-cols-2 gap-3 md:col-span-2">
            {[
              { href: profile.github, label: 'GitHub', Icon: GithubIcon },
              { href: profile.linkedin, label: 'LinkedIn', Icon: LinkedinIcon },
            ].map(({ href, label, Icon }) => (
              <Tile key={label} as="a" href={href} target="_blank" rel="noreferrer" className="group flex flex-col justify-between p-5">
                <Icon className="h-6 w-6" data-gravity />
                <span className="mt-8 flex items-center justify-between text-sm font-medium">
                  {label}
                  <ArrowUpRight size={15} className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Tile>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
