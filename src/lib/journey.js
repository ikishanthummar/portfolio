// page scroll progress (0..1), read by the shader every frame
export const journey = { progress: 0 }

// camera keyframes from the top of the page to the bottom, one set per scene.
// black hole distances are in Schwarzschild radii, wormhole ones in throat radii,
// galaxy ones in thousands of light years from Sagittarius A* at the core.
const keys = {
  blackhole: [
    { at: 0.0, dist: 24, yaw: 0.0, pitch: 0.1, fov: 1.55, shift: 0 },
    { at: 0.22, dist: 19, yaw: 0.7, pitch: 0.5, fov: 1.5, shift: 0 },
    { at: 0.48, dist: 15, yaw: 1.7, pitch: -0.28, fov: 1.45, shift: 0 },
    { at: 0.74, dist: 12, yaw: 2.6, pitch: 0.06, fov: 1.35, shift: 0 },
    { at: 1.0, dist: 7.5, yaw: 3.14, pitch: 0.03, fov: 1.1, shift: 0 },
  ],
  wormhole: [
    { at: 0.0, dist: 7, yaw: 0.0, pitch: 0.12, fov: 1.5, shift: 0.3 },
    { at: 0.22, dist: 6, yaw: 0.6, pitch: 0.32, fov: 1.5, shift: 0.1 },
    { at: 0.48, dist: 5, yaw: 1.4, pitch: -0.15, fov: 1.45, shift: 0 },
    { at: 0.74, dist: 3.8, yaw: 2.2, pitch: 0.08, fov: 1.35, shift: 0 },
    { at: 1.0, dist: 1.8, yaw: 2.6, pitch: 0.04, fov: 1.2, shift: 0 },
  ],
  // high above the whole spiral, then sweeping around and down toward the disk, ending just
  // above it out near the Sun's orbit, looking across the arms at the core
  galaxy: [
    { at: 0.0, dist: 105, yaw: 0.2, pitch: 0.95, fov: 1.5, shift: 0.33 },
    { at: 0.22, dist: 88, yaw: 0.7, pitch: 0.75, fov: 1.5, shift: 0.12 },
    { at: 0.48, dist: 70, yaw: 1.4, pitch: 0.45, fov: 1.45, shift: 0 },
    { at: 0.74, dist: 52, yaw: 2.1, pitch: 0.32, fov: 1.4, shift: 0 },
    { at: 1.0, dist: 36, yaw: 2.7, pitch: 0.2, fov: 1.35, shift: 0 },
  ],
}

const SCENES = { dark: 'blackhole', galaxy: 'galaxy', light: 'wormhole' }
const UNITS = { blackhole: 'Rs', wormhole: 'R', galaxy: 'kly' }
export const sceneFor = (theme) => SCENES[theme] ?? 'blackhole'
export const distUnit = (scene) => UNITS[scene]

const lerp = (a, b, t) => a + (b - a) * t

export function cameraAt(p, scene = 'blackhole') {
  const k = keys[scene]
  let i = 0
  while (i < k.length - 2 && p > k[i + 1].at) i++
  const a = k[i]
  const b = k[i + 1]
  let t = Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at)))
  t = t * t * (3 - 2 * t)
  return {
    dist: lerp(a.dist, b.dist, t),
    yaw: lerp(a.yaw, b.yaw, t),
    pitch: lerp(a.pitch, b.pitch, t),
    fov: lerp(a.fov, b.fov, t),
    shift: lerp(a.shift, b.shift, t),
  }
}

// Miller's planet from Interstellar: 1 hour = 7 years (61,320 hours)
const MAX_DILATION = 61320
export const dilationAt = (p) => Math.exp(p * Math.log(MAX_DILATION))

export function formatDilation(hours) {
  if (hours < 24) return `${hours.toFixed(1)} hrs`
  if (hours < 24 * 30) return `${(hours / 24).toFixed(1)} days`
  if (hours < 8760) return `${(hours / 730).toFixed(1)} months`
  return `${(hours / 8760).toFixed(1)} years`
}
