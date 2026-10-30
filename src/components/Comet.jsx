import { useEffect, useRef } from 'react'
import { playShockwave } from '../lib/sound'

const GRAVITY_SELECTOR = '.chip, .squircle, [data-gravity]'
const WAVE_SELECTOR = '.tile, .chip, .squircle, [data-gravity]'

// cursor trail, click ripple and the chip "gravity" all run off this one canvas
export default function Comet() {
  const canvas = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canvasEl = canvas.current
    const ctx = canvasEl.getContext('2d')
    let width = 0
    let height = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvasEl.width = width * dpr
      canvasEl.height = height * dpr
      canvasEl.style.width = `${width}px`
      canvasEl.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    if (fine) document.documentElement.classList.add('has-cursor')

    const mouse = { x: -200, y: -200, visible: false, down: false, lastMove: 0 }
    const head = { x: -200, y: -200, r: 3 }
    let trail = []
    let sparks = []
    let rings = []
    let hover = null // null | 'stick' | label text
    let inSpace = false // over an always-dark area (the black hole tile)

    let bodies = []
    let lastScan = 0
    const offsets = new Map()

    const shock = (x, y) => {
      rings.push({ x, y, t: performance.now() })
      playShockwave((x / window.innerWidth) * 2 - 1)
      if (reduce) return
      const vh = window.innerHeight
      document.querySelectorAll(WAVE_SELECTOR).forEach((el) => {
        const r = el.getBoundingClientRect()
        if (!r.width || r.bottom < 0 || r.top > vh) return
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const dx = cx - x
        const dy = cy - y
        const d = Math.hypot(dx, dy) || 1
        const amp = 16 * Math.exp(-d / 520)
        if (amp < 0.6) return
        const ux = (dx / d) * amp
        const uy = (dy / d) * amp
        el.animate(
          [
            { transform: 'translate(0px, 0px)' },
            { transform: `translate(${ux}px, ${uy}px) scale(${1 - amp / 700})`, offset: 0.3 },
            { transform: `translate(${-ux * 0.3}px, ${-uy * 0.3}px)`, offset: 0.65 },
            { transform: 'translate(0px, 0px)' },
          ],
          { duration: 750, delay: d / 1.5, easing: 'cubic-bezier(.2,.7,.3,1)', composite: 'add' },
        )
      })
    }

    const onMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.lastMove = performance.now()
      if (!mouse.visible) {
        mouse.visible = true
        head.x = mouse.x
        head.y = mouse.y
        trail = []
      }
    }
    const onOver = (e) => {
      inSpace = !!e.target.closest('[data-space]')
      const labelled = e.target.closest('[data-cursor]')
      if (labelled) hover = labelled.dataset.cursor
      else hover = e.target.closest('a, button, [data-stick]') ? 'stick' : null
    }
    const onLeave = () => (mouse.visible = false)
    const onDown = (e) => {
      mouse.down = true
      shock(e.clientX, e.clientY)
    }
    const onUp = () => (mouse.down = false)

    // read all rects first, then write, so we don't thrash layout
    const gravity = (now) => {
      if (!fine || reduce) return
      if (now - lastScan > 1000) {
        bodies = Array.from(document.querySelectorAll(GRAVITY_SELECTOR))
        lastScan = now
      }
      const R = 150
      const MAX = 9
      const active = mouse.visible && now - mouse.lastMove < 2500
      if (!active && offsets.size === 0) return
      const updates = []
      for (const el of bodies) {
        const offset = offsets.get(el) || { x: 0, y: 0 }
        let tx = 0
        let ty = 0
        if (active) {
          const r = el.getBoundingClientRect()
          if (r.width && r.right > mouse.x - R && r.left < mouse.x + R && r.bottom > mouse.y - R && r.top < mouse.y + R) {
            const cx = r.left + r.width / 2 - offset.x
            const cy = r.top + r.height / 2 - offset.y
            const dx = mouse.x - cx
            const dy = mouse.y - cy
            const d = Math.hypot(dx, dy)
            if (d < R && d > 1) {
              const f = (1 - d / R) ** 2
              tx = (dx / d) * f * MAX
              ty = (dy / d) * f * MAX
            }
          }
        }
        if (tx || ty || offsets.has(el)) updates.push([el, offset, tx, ty])
      }
      for (const [el, offset, tx, ty] of updates) {
        offset.x += (tx - offset.x) * 0.15
        offset.y += (ty - offset.y) * 0.15
        if (!tx && !ty && Math.abs(offset.x) < 0.05 && Math.abs(offset.y) < 0.05) {
          el.style.translate = ''
          offsets.delete(el)
        } else {
          offsets.set(el, offset)
          el.style.translate = `${offset.x.toFixed(2)}px ${offset.y.toFixed(2)}px`
        }
      }
    }

    let raf
    const frame = (now) => {
      ctx.clearRect(0, 0, width, height)
      const dark = document.documentElement.classList.contains('dark')
      const glowy = dark || inSpace
      const col = glowy ? '255,226,192' : '18,18,18'

      rings = rings.filter((r) => now - r.t < 1500)
      for (const r of rings) {
        const k = (now - r.t) / 1500
        for (const lag of [0, 0.1, 0.2]) {
          const kk = k - lag
          if (kk <= 0) continue
          ctx.beginPath()
          ctx.arc(r.x, r.y, kk * Math.max(width, height) * 0.85, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${col},${(1 - kk) ** 2 * (0.3 - lag)})`
          ctx.lineWidth = 1 + (1 - kk) * 3
          ctx.stroke()
        }
      }

      if (fine && mouse.visible) {
        const px = head.x
        const py = head.y
        head.x += (mouse.x - head.x) * 0.35
        head.y += (mouse.y - head.y) * 0.35
        const vx = head.x - px
        const vy = head.y - py
        const speed = Math.hypot(vx, vy)

        trail.push({ x: head.x, y: head.y, t: now })
        trail = trail.filter((p) => now - p.t < 260)

        if (speed > 6 && !reduce) {
          for (let i = 0; i < 2; i++) {
            sparks.push({
              x: head.x,
              y: head.y,
              vx: -vx * 0.12 + (Math.random() - 0.5) * 1.8,
              vy: -vy * 0.12 + (Math.random() - 0.5) * 1.8,
              life: 1,
            })
          }
        }

        const target = hover ? 4.5 : 3
        head.r += ((mouse.down ? target * 0.7 : target) - head.r) * 0.2

        ctx.globalCompositeOperation = glowy ? 'lighter' : 'source-over'
        ctx.lineCap = 'round'
        for (let i = 1; i < trail.length; i++) {
          const k = i / trail.length
          ctx.beginPath()
          ctx.moveTo(trail[i - 1].x, trail[i - 1].y)
          ctx.lineTo(trail[i].x, trail[i].y)
          ctx.strokeStyle = `rgba(${col},${k ** 1.6 * 0.8})`
          ctx.lineWidth = head.r * 1.6 * k ** 1.3
          ctx.stroke()
        }

        sparks = sparks.filter((s) => (s.life -= 0.028) > 0)
        for (const s of sparks) {
          s.x += s.vx
          s.y += s.vy
          s.vx *= 0.95
          s.vy *= 0.95
          ctx.beginPath()
          ctx.arc(s.x, s.y, 0.3 + s.life * 0.8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${col},${s.life * 0.8})`
          ctx.fill()
        }

        const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, head.r * 3.5)
        g.addColorStop(0, `rgba(${col},${glowy ? 0.5 : 0.2})`)
        g.addColorStop(1, `rgba(${col},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(head.x, head.y, head.r * 3.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(head.x, head.y, head.r, 0, Math.PI * 2)
        ctx.fillStyle = glowy ? '#ffffff' : '#111111'
        ctx.fill()

        if (hover) {
          ctx.beginPath()
          ctx.arc(head.x, head.y, head.r + 5, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${col},0.55)`
          ctx.lineWidth = 1
          ctx.stroke()
        }
        ctx.globalCompositeOperation = 'source-over'

        if (hover && hover !== 'stick') {
          const text = hover.toUpperCase()
          ctx.font = '600 9px "JetBrains Mono", monospace'
          const tw = ctx.measureText(text).width
          const bx = head.x + 12
          const by = head.y + 10
          ctx.beginPath()
          ctx.roundRect(bx, by, tw + 12, 18, 9)
          ctx.fillStyle = glowy ? '#f2f2f2' : '#111111'
          ctx.fill()
          ctx.fillStyle = glowy ? '#111111' : '#f2f2f2'
          ctx.fillText(text, bx + 6, by + 12.2)
        }
      }

      gravity(now)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.documentElement.addEventListener('mouseleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      offsets.forEach((_, el) => (el.style.translate = ''))
    }
  }, [])

  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]" />
}
