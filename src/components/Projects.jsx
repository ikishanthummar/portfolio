import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import { projects } from '../data'
import { BorderBeam, Reveal, SectionHeading, Tile, ease } from './ui'
import { startScroll, stopScroll } from '../lib/scroll'

const filters = ['All', 'Fintech', 'Enterprise', 'Events', 'Real-time']

function Segmented({ value, onChange }) {
  return (
    <div className="tile inline-flex rounded-full p-1">
      {filters.map((f) => (
        <button key={f} onClick={() => onChange(f)} className="relative rounded-full px-3.5 py-1.5 text-xs font-medium sm:px-4 sm:text-[13px]">
          {value === f && (
            <motion.span layoutId="seg" className="absolute inset-0 rounded-full bg-fg" transition={{ type: 'spring', stiffness: 450, damping: 36 }} />
          )}
          <span className={`relative transition-colors ${value === f ? 'text-bg' : 'text-muted'}`}>{f}</span>
        </button>
      ))}
    </div>
  )
}

function Cover({ p, tall }) {
  return (
    <div className={`relative overflow-hidden rounded-[20px] bg-[#0c0c0c] ${tall ? 'h-52 sm:h-64' : 'h-44'}`}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(100% 80% at 90% 0%, ${p.color}40, transparent 60%)` }} />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />
      <div className="absolute bottom-[-14%] right-[6%] w-[80%] rounded-xl border border-white/10 bg-white/[0.05] shadow-2xl backdrop-blur-md transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2">
        <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="ml-2 font-mono text-[10px] text-white/40">{p.name.toLowerCase()}</span>
        </div>
        <div className="space-y-2.5 p-3">
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-md bg-white/[0.05] p-2">
                <span className="block h-1.5 w-1/2 rounded-full bg-white/15" />
                <span className="mt-1.5 block h-2.5 w-3/4 rounded-full" style={{ background: i === 0 ? p.color : 'rgba(255,255,255,0.18)' }} />
              </div>
            ))}
          </div>
          <svg viewBox="0 0 200 50" className="h-12 w-full">
            <defs>
              <linearGradient id={`g-${p.name}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={p.color} stopOpacity="0.4" />
                <stop offset="1" stopColor={p.color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 40 C25 32 35 36 55 26 S85 14 105 22 S140 8 160 12 S190 4 200 2 L200 50 L0 50Z" fill={`url(#g-${p.name})`} />
            <path d="M0 40 C25 32 35 36 55 26 S85 14 105 22 S140 8 160 12 S190 4 200 2" fill="none" stroke={p.color} strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-md">
        {p.category}
      </span>
    </div>
  )
}

function Sheet({ p, onClose }) {
  useEffect(() => {
    stopScroll()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      startScroll()
    }
  }, [onClose])

  return (
    <motion.div className="fixed inset-0 z-[85] flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={p.name}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => (info.offset.y > 120 || info.velocity.y > 600) && onClose()}
        className="tile relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-b-none rounded-t-[32px] bg-surface/95"
      >
        <div className="flex justify-center pb-1 pt-3">
          <span className="h-1.5 w-10 rounded-full bg-line/20" />
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-line/[0.08] text-muted hover:text-fg"
        >
          <X size={15} />
        </button>
        <div data-lenis-prevent className="overflow-y-auto px-4 pb-10 pt-2 sm:px-6">
          <Cover p={p} tall />
          <h3 className="mt-5 text-2xl font-semibold tracking-tight">{p.name}</h3>
          <div className="text-sm text-muted">{p.role}</div>
          <p className="mt-4 leading-relaxed text-fg/85">{p.summary}</p>

          <div className="label mt-7">What I built</div>
          <div className="tile mt-3 overflow-hidden rounded-[20px] shadow-none">
            {p.points.map((pt, i) => (
              <motion.div
                key={pt}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className={`flex gap-3 px-4 py-3 text-sm leading-relaxed text-muted ${i ? 'border-t border-line/[0.07]' : ''}`}
              >
                <span className="font-mono text-xs text-fg/60">{String(i + 1).padStart(2, '0')}</span>
                {pt}
              </motion.div>
            ))}
          </div>

          <div className="label mt-7">Tech stack</div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.stack.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Projects() {
  const [filter, setFilter] = useState('All')
  const [open, setOpen] = useState(null)
  const close = useCallback(() => setOpen(null), [])
  const list = projects.filter((p) => filter === 'All' || p.category === filter)

  return (
    <section id="work" className="wrap py-20 sm:py-24">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading label="Selected work" title="Products I've" shine="built & shipped." />
        <Reveal className="mb-8 overflow-x-auto sm:mb-10">
          <Segmented value={filter} onChange={setFilter} />
        </Reveal>
      </div>

      <LayoutGroup>
        <motion.div layout className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => {
              const featured = i === 0 && filter === 'All'
              return (
                <motion.div
                  key={p.name}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.45, ease }}
                  className={featured ? 'md:col-span-2' : ''}
                >
                  <Tile
                    as="button"
                    onClick={() => setOpen(p)}
                    data-cursor="View"
                    className={`group flex h-full w-full flex-col p-2.5 text-left ${featured ? 'beam' : ''}`}
                  >
                    {featured && <BorderBeam />}
                    <Cover p={p} tall={featured} />
                    <div className="flex flex-1 flex-col px-2.5 pb-2 pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-[17px] font-semibold tracking-tight">{p.name}</h3>
                          <div className="text-xs text-muted">{p.role}</div>
                        </div>
                        <span className="squircle h-8 w-8 rounded-full transition-transform duration-500 group-hover:rotate-45">
                          <ArrowUpRight size={15} />
                        </span>
                      </div>
                      <p className="mt-2.5 text-sm leading-relaxed text-muted">{p.summary}</p>
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                        {p.stack.slice(0, featured ? 6 : 3).map((s) => (
                          <span key={s} className="chip">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Tile>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      <AnimatePresence>{open && <Sheet p={open} onClose={close} />}</AnimatePresence>
    </section>
  )
}
