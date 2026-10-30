import { Server, Monitor, Database, Boxes, CloudCog, Wrench } from 'lucide-react'
import { skillGroups } from '../data'
import { Reveal, SectionHeading, Tile } from './ui'

const icons = { backend: Server, frontend: Monitor, database: Database, architecture: Boxes, cloud: CloudCog, tools: Wrench }
// 3 columns: 2+1 / 1+2 / 2+1
const spans = {
  backend: 'md:col-span-2',
  frontend: '',
  database: '',
  architecture: 'md:col-span-2',
  cloud: 'md:col-span-2',
  tools: '',
}

export default function Skills() {
  return (
    <section id="skills" className="wrap py-20 sm:py-24">
      <SectionHeading label="Skills" title="The toolkit" shine="behind the work." subtitle="Six years on the .NET ecosystem, paired with modern frontends and cloud infrastructure." />

      <div className="grid gap-3 md:grid-cols-3">
        {skillGroups.map((g, i) => {
          const Icon = icons[g.key]
          return (
            <Reveal key={g.key} delay={(i % 3) * 0.06} className={spans[g.key]}>
              <Tile className="h-full p-6">
                <div className="flex items-center gap-3">
                  <span className="squircle h-10 w-10">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold tracking-tight">{g.title}</h3>
                    <p className="text-xs text-muted">{g.blurb}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {g.items.map((s) => (
                    <span key={s} className="chip transition-colors hover:bg-line/10 hover:text-fg">
                      {s}
                    </span>
                  ))}
                </div>
              </Tile>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
