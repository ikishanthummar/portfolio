import { profile } from '../data'

export default function Footer() {
  return (
    <footer className="wrap pb-28 pt-4">
      <div className="flex flex-col items-center justify-between gap-2 border-t border-line/[0.07] pt-6 text-xs text-muted sm:flex-row">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>
          Press <kbd className="rounded border border-line/15 px-1 font-mono text-[10px]">Ctrl K</kbd> to navigate
        </span>
      </div>
    </footer>
  )
}
