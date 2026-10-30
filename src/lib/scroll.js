import Lenis from 'lenis'

let lenis = null

export function initLenis() {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 })
  let id
  const raf = (t) => {
    lenis.raf(t)
    id = requestAnimationFrame(raf)
  }
  id = requestAnimationFrame(raf)

  const onClick = (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a) return
    const href = a.getAttribute('href')
    e.preventDefault()
    lenis.scrollTo(href === '#top' ? 0 : href, { duration: 1.6 })
  }
  document.addEventListener('click', onClick)

  return () => {
    document.removeEventListener('click', onClick)
    cancelAnimationFrame(id)
    lenis.destroy()
    lenis = null
  }
}

export const scrollToId = (id) => {
  if (lenis) lenis.scrollTo(id === 'top' ? 0 : `#${id}`, { duration: 1.6 })
  else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export const openCommandMenu = () => window.dispatchEvent(new Event('cmdk:open'))

export const stopScroll = () => lenis?.stop()
export const startScroll = () => lenis?.start()
