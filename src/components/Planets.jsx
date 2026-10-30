import { useId } from 'react'

// Planets from Interstellar, drawn as small SVG spheres. Each gets unique gradient ids
// because several copies can be on the page at once.

function useIds() {
  const id = useId().replace(/:/g, '')
  return (name) => `${id}-${name}`
}

// soft terminator so every planet reads as a lit sphere
function Shade({ id }) {
  return (
    <radialGradient id={id} cx="32%" cy="28%" r="80%">
      <stop offset="0.45" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.55" />
    </radialGradient>
  )
}

function Sphere({ size, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="overflow-visible">
      {children}
    </svg>
  )
}

export function Earth({ size = 18 }) {
  const id = useIds()
  return (
    <Sphere size={size}>
      <defs>
        <radialGradient id={id('ocean')} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#8fd0ff" />
          <stop offset="0.55" stopColor="#2a6fdb" />
          <stop offset="1" stopColor="#0d2f6e" />
        </radialGradient>
        <Shade id={id('shade')} />
        <clipPath id={id('clip')}>
          <circle cx="12" cy="12" r="9" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r="10.4" fill="none" stroke="#8fd0ff" strokeOpacity="0.45" strokeWidth="0.9" />
      <circle cx="12" cy="12" r="9" fill={`url(#${id('ocean')})`} />
      <g clipPath={`url(#${id('clip')})`}>
        <path d="M4.5 9.5c1.8-2.2 4-1.4 5 .2.8 1.3.8 2.6 2.7 2.8 1.8.2 2.3 2 1.2 3.7-1.2 1.7-3.6 1.9-4.8.8-1.1-1-1.6-2.7-3.4-2.9-1.6-.2-2.3-2.6-.7-4.6Z" fill="#4fae6c" />
        <path d="M14 4.6c2.1-.2 4.2.9 5 2.7.6 1.4-.7 2.1-1.9 1.9-1.6-.3-3-1.1-3.4-2.3-.3-.9.3-2.3.3-2.3Z" fill="#7bc47a" />
        <path d="M2.5 14.5c3-1.1 6 .8 9.2-.1s6.3-2.3 9.8-1" stroke="#fff" strokeOpacity="0.75" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <path d="M6 5.5c2-.6 3.7-.3 5.2.3" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      </g>
      <circle cx="12" cy="12" r="9" fill={`url(#${id('shade')})`} />
    </Sphere>
  )
}

export function Miller({ size = 18 }) {
  const id = useIds()
  return (
    <Sphere size={size}>
      <defs>
        <radialGradient id={id('sea')} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#b9f5f1" />
          <stop offset="0.55" stopColor="#2bb3b1" />
          <stop offset="1" stopColor="#0b5462" />
        </radialGradient>
        <Shade id={id('shade')} />
        <clipPath id={id('clip')}>
          <circle cx="12" cy="12" r="9" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r="9" fill={`url(#${id('sea')})`} />
      <g clipPath={`url(#${id('clip')})`} fill="none" strokeLinecap="round">
        {/* the mountain-sized wave */}
        <path d="M2 12.5c2.5-.2 4-3.2 6.2-3.2 2.4 0 2.6 3.4 5 3.4 2.3 0 3.4-2.2 5.8-2.2 1.2 0 2.2.6 3 1.2" stroke="#fff" strokeOpacity="0.9" strokeWidth="1.3" />
        <path d="M2 16.2c2.6-.8 5.2.6 7.6 0s4.9-1.6 7.6-.9 3.4.9 4.8.7" stroke="#e8fffd" strokeOpacity="0.55" strokeWidth="0.8" />
        <path d="M3 6.8c2.2-.5 4.4.3 6.6-.1" stroke="#e8fffd" strokeOpacity="0.45" strokeWidth="0.7" />
      </g>
      <circle cx="12" cy="12" r="9" fill={`url(#${id('shade')})`} />
    </Sphere>
  )
}

export function Mann({ size = 18 }) {
  const id = useIds()
  return (
    <Sphere size={size}>
      <defs>
        <radialGradient id={id('ice')} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#cfe2f0" />
          <stop offset="1" stopColor="#6f8fa8" />
        </radialGradient>
        <Shade id={id('shade')} />
        <clipPath id={id('clip')}>
          <circle cx="12" cy="12" r="9" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r="9" fill={`url(#${id('ice')})`} />
      <g clipPath={`url(#${id('clip')})`} fill="none" strokeLinecap="round">
        {/* frozen cloud ridges */}
        <path d="M3 8.5c3.2-1.6 6.3.6 9.4-.7 2.7-1.1 5.2-1.4 8.6.1" stroke="#7d97ad" strokeOpacity="0.6" strokeWidth="0.9" />
        <path d="M2.5 13c3.6-1.2 7 1 10.6-.4 2.6-1 5.3-.6 8.4.4" stroke="#8aa4b8" strokeOpacity="0.5" strokeWidth="0.8" />
        <path d="M5 17.4c2.6-.6 5.4.2 8.2-.3" stroke="#93abbd" strokeOpacity="0.5" strokeWidth="0.7" />
        <circle cx="15.5" cy="15.2" r="1.3" stroke="#8aa4b8" strokeOpacity="0.55" strokeWidth="0.6" />
      </g>
      <circle cx="12" cy="12" r="9" fill={`url(#${id('shade')})`} />
    </Sphere>
  )
}

export function Edmunds({ size = 18 }) {
  const id = useIds()
  return (
    <Sphere size={size}>
      <defs>
        <radialGradient id={id('rock')} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#ffe1ad" />
          <stop offset="0.55" stopColor="#e08a3c" />
          <stop offset="1" stopColor="#6e3212" />
        </radialGradient>
        <Shade id={id('shade')} />
        <clipPath id={id('clip')}>
          <circle cx="12" cy="12" r="9" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r="9" fill={`url(#${id('rock')})`} />
      <g clipPath={`url(#${id('clip')})`}>
        <path d="M2 10c3.5-1.2 7 .9 10.5-.2s6.5-1.6 9.5-.4v2.2c-3 -1-6 .2-9.5 1.2S5.5 12.1 2 12.6Z" fill="#a8541f" fillOpacity="0.55" />
        <path d="M2 15.5c3.4-.8 6.8.6 10.2-.1s6.6-1.4 9.8-.2v1.6c-3.2-1-6.4.1-9.8.8s-6.8-.6-10.2.1Z" fill="#c26a2c" fillOpacity="0.45" />
        <circle cx="8" cy="6.8" r="1.1" fill="#fff1d6" fillOpacity="0.5" />
      </g>
      <circle cx="12" cy="12" r="9" fill={`url(#${id('shade')})`} />
    </Sphere>
  )
}

export function Gargantua({ size = 18 }) {
  const id = useIds()
  return (
    <Sphere size={size}>
      <defs>
        <linearGradient id={id('disk')} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ff9a4d" />
          <stop offset="0.5" stopColor="#fff1dc" />
          <stop offset="1" stopColor="#ff9a4d" />
        </linearGradient>
      </defs>
      {/* far side of the disk, lensed over the top */}
      <path d="M5.2 12a6.8 6.8 0 0 1 13.6 0" fill="none" stroke={`url(#${id('disk')})`} strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
      <ellipse cx="12" cy="12" rx="11" ry="2.6" fill="none" stroke={`url(#${id('disk')})`} strokeWidth="1.8" opacity="0.55" />
      <circle cx="12" cy="12" r="4.6" fill="#050505" stroke="#ffd2a1" strokeOpacity="0.8" strokeWidth="0.5" />
      {/* near side of the disk, in front of the shadow */}
      <path d="M1 12a11 2.6 0 0 0 22 0" fill="none" stroke={`url(#${id('disk')})`} strokeWidth="2" strokeLinecap="round" />
    </Sphere>
  )
}
