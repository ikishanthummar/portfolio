import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { pointer } from '../lib/pointer'
import { cameraAt, journey } from '../lib/journey'
import { isMobile } from '../shaders/common'
import { blackHole } from '../shaders/blackhole'
import { wormhole } from '../shaders/wormhole'
import Galaxy from './Galaxy'

const SHADERS = { blackhole: blackHole, wormhole }
const BASE_DPR = isMobile ? 0.85 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1)
const MIN_DPR = 0.4
// the background moves slowly, so ~60fps is plenty. rendering it at 120-240hz only starves the
// GPU that scrolling and the rest of the page need
const FPS = 60
// the page should hold this (ms per frame), or 1.3x the screen's refresh interval on slow screens
const PAGE_TARGET = 1000 / 90

const vertexShader = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`

// drives the canvas (frameloop="never"):
// - first measures the screen's refresh rate with nothing drawn (the preloader covers the canvas
//   meanwhile). measuring while the shader runs would only see how slow the GPU is.
// - then draws on every Nth refresh so the shader runs at 60-120fps on any screen, evenly paced:
//   up to 119hz every frame, 120hz -> 60fps, 144hz -> 72, 200hz -> 67, 240hz -> 60.
//   advance() draws right here; invalidate() would only queue the frame for the next refresh
// - picks the resolution from how the whole page keeps up, since that is what feels laggy. a
//   second over the target: render fewer pixels (a big step when far over). ~3s comfortably under
//   it: go back up, but never to a size that was already too slow. otherwise it bounces between
//   the two, and every resize reallocates the canvas and stutters. gaps over 1s are tab switches
function Ticker() {
  const get = useThree((state) => state.get)

  useEffect(() => {
    const gaps = []
    let raf
    let first
    let start
    let prev = 0
    let count = 0
    let every = 1
    let refresh = 0 // ms, 0 until measured
    let frameTime = 0
    let slowFor = 0
    let fastFor = 0
    let ceiling = BASE_DPR

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      first ??= now
      const state = get()
      const gap = now - prev
      prev = now

      if (!refresh) {
        if (gap > 0 && gap < 100) gaps.push(gap)
        if (gaps.length < 30 && now - first < 2000) return
        gaps.sort((a, b) => a - b)
        refresh = gaps.length ? gaps[gaps.length >> 2] : 1000 / FPS
        every = Math.max(1, Math.floor(1000 / refresh / FPS + 0.1))
        frameTime = refresh
        start = now
      } else if (gap < 1000) {
        const target = Math.max(PAGE_TARGET, refresh * 1.3)
        frameTime += (Math.min(gap, 250) - frameTime) * 0.05
        if (frameTime > target) {
          slowFor += gap
          fastFor = 0
        } else if (frameTime < target / 1.15) {
          fastFor += gap
          slowFor = 0
        }
        const dpr = state.viewport.dpr
        if (slowFor > 1000 && dpr > MIN_DPR) {
          ceiling = Math.max(MIN_DPR, dpr * 0.97)
          state.setDpr(Math.max(MIN_DPR, dpr * (frameTime > target * 2 ? 0.7 : 0.85)))
          slowFor = 0
          frameTime = refresh
        } else if (fastFor > 3000 && dpr < ceiling) {
          state.setDpr(Math.min(ceiling, dpr * 1.08))
          fastFor = 0
        }
      }

      if (++count % every) return
      // the canvas clock starts at 0, so count from the first frame
      state.advance((now - start) / 1000)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [get])

  return null
}

function Quad({ scene }) {
  const size = useMemo(() => new THREE.Vector2(), [])
  const clock = useRef(0)
  const progress = useRef(journey.progress)
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: SHADERS[scene],
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uRes: { value: new THREE.Vector2() },
          uCam: { value: new THREE.Vector2() },
          uDist: { value: 10 },
          uYaw: { value: 0 },
          uPitch: { value: 0.1 },
          uFov: { value: 1.5 },
          uShift: { value: 0 },
        },
      }),
    [scene],
  )

  useFrame((state, dt) => {
    const uniforms = material.uniforms

    progress.current = THREE.MathUtils.damp(progress.current, journey.progress, 4, dt)
    const cam = cameraAt(progress.current, scene)
    uniforms.uDist.value = cam.dist
    uniforms.uYaw.value = cam.yaw
    uniforms.uPitch.value = cam.pitch
    uniforms.uFov.value = cam.fov
    // narrow screens: keep the subject centred, there is no room beside the text
    uniforms.uShift.value = state.size.width < 768 ? 0 : cam.shift
    clock.current += dt * (1 + progress.current * 2.5)
    uniforms.uTime.value = clock.current
    state.gl.getDrawingBufferSize(size)
    uniforms.uRes.value.copy(size)
    uniforms.uCam.value.x = THREE.MathUtils.damp(uniforms.uCam.value.x, pointer.x, 2, dt)
    uniforms.uCam.value.y = THREE.MathUtils.damp(uniforms.uCam.value.y, pointer.y, 2, dt)
  })

  return (
    <mesh frustumCulled={false} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}

// full-screen background: shader scenes 'blackhole' (dark theme) and 'wormhole' (light theme),
// or the 3D point-cloud Milky Way 'galaxy' (galaxy theme)
export default function SpaceScene({ scene }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={BASE_DPR}
        frameloop="never"
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        flat
      >
        <Ticker />
        {scene === 'galaxy' ? <Galaxy /> : <Quad scene={scene} />}
      </Canvas>
    </div>
  )
}
