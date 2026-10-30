import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Check, ChevronRight, Copy, Mail, Phone } from 'lucide-react'
import { profile } from '../data'
import { BorderBeam, GithubIcon, LinkedinIcon, Magnetic, Reveal, Scramble, Tile } from './ui'

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch (e) {}
  }

  const rows = [
    { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, Icon: Mail },
    { label: 'Phone', value: profile.phone, href: profile.phoneHref, Icon: Phone },
    { label: 'LinkedIn', value: 'in/ikishanthummar', href: profile.linkedin, Icon: LinkedinIcon },
    { label: 'GitHub', value: 'ikishanthummar', href: profile.github, Icon: GithubIcon },
  ]

  return (
    <section id="contact" className="wrap py-20 sm:py-24">
      <Reveal>
        <Tile className="beam overflow-hidden p-6 sm:p-10">
          <BorderBeam />
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center [&>*]:min-w-0">
            <div>
              <span className="label">Contact</span>
              <h2 className="mt-3 text-[2rem] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl">
                <Scramble text="Let's build" />
                <br />
                <span className="text-shine">something great.</span>
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
                Have a role, a project or a payment system that needs a reliable backend? My inbox is always open.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <Magnetic>
                  <a href={`mailto:${profile.email}`} className="btn-solid">
                    Say hello <ArrowUpRight size={16} />
                  </a>
                </Magnetic>
                <button onClick={copy} className="btn-soft">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={copied ? 'y' : 'n'}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="inline-flex items-center gap-2"
                    >
                      {copied ? <Check size={16} className="text-ios" /> : <Copy size={16} />}
                      {copied ? 'Copied' : 'Copy email'}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-[22px] border border-line/[0.07] bg-line/[0.025]">
              {rows.map(({ label, value, href, Icon }, i) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className={`group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-line/[0.04] ${i ? 'border-t border-line/[0.07]' : ''}`}
                >
                  <span className="squircle h-9 w-9 rounded-[10px]">
                    <Icon className="h-4 w-4" size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] text-muted">{label}</span>
                    <span className="block truncate text-sm font-medium">{value}</span>
                  </span>
                  <ChevronRight size={16} className="text-muted transition-transform group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          </div>
        </Tile>
      </Reveal>
    </section>
  )
}
