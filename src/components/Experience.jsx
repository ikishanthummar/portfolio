import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { experience } from '../data'
import { Reveal, SectionHeading, Tile, ease } from './ui'

const initials = (name) =>
  name
    .split(' ')
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

export default function Experience() {
  const [open, setOpen] = useState(0)

  return (
    <section id="experience" className="wrap py-20 sm:py-24">
      <SectionHeading label="Experience" title="Six years," shine="four teams." subtitle="From trainee to owning payment platforms end-to-end." />

      <Reveal>
        <Tile className="overflow-hidden p-2">
          {experience.map((job, i) => {
            const isOpen = open === i
            return (
              <div key={job.company} className={i ? 'border-t border-line/[0.07]' : ''}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  data-cursor={isOpen ? 'Close' : 'Open'}
                  className="flex w-full items-center gap-4 rounded-[20px] px-3 py-4 text-left transition-colors hover:bg-line/[0.03] sm:px-4"
                >
                  <span className="squircle h-11 w-11 text-xs font-bold tracking-wide">{initials(job.company)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-semibold tracking-tight">{job.company}</span>
                      {job.current && <span className="h-2 w-2 shrink-0 rounded-full bg-ios shadow-[0_0_8px_#30d158]" />}
                    </span>
                    <span className="block truncate text-sm text-muted">{job.role}</span>
                  </span>
                  <span className="hidden font-mono text-xs text-muted sm:block">{job.period}</span>
                  <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.35, ease }} className="text-muted">
                    <ChevronRight size={18} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease }}
                      className="overflow-hidden"
                    >
                      <div className="pb-5 pl-[4.4rem] pr-4 sm:pl-[4.65rem] sm:pr-6">
                        <div className="mb-3 font-mono text-xs text-muted sm:hidden">{job.period}</div>
                        <ul className="grid gap-x-8 gap-y-2.5 md:grid-cols-2">
                          {job.points.map((p) => (
                            <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-fg/50" />
                              {p}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {job.tags.map((t) => (
                            <span key={t} className="chip">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </Tile>
      </Reveal>
    </section>
  )
}
