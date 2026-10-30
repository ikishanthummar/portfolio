import * as THREE from 'three'
import { isMobile } from '../shaders/common'
import {
  MAP_SIZE,
  mapFragment,
  mapVertex,
  pointVertex,
  sliceFragment,
  sliceVertex,
  starFragment,
  toneFragment,
  toneVertex,
} from '../shaders/galaxy'

// The Milky Way for the galaxy theme. 1 world unit = 1,000 light years; the disk is ~100,000
// ly across, lying in the xz plane.

export const SPIN = 0.006 // radians per second
const MAP_RES = isMobile ? 1024 : 2048
// slice heights (thousand ly): evenly and closely spaced through the thin disk, so seen at a
// low angle the layers blend instead of showing as stripes, then a few wider ones for the bulge
const DISK_SLICES = isMobile ? 12 : 16
const DISK_SPAN = 0.9
const BULGE_HEIGHTS = [1.25, 1.8, 2.6, 3.6]

function random(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// the face-on map is painted once, on the GPU, the first time the galaxy is drawn
export function createMap() {
  const target = new THREE.WebGLRenderTarget(MAP_RES, MAP_RES, {
    depthBuffer: false,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
  })
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ vertexShader: mapVertex, fragmentShader: mapFragment, depthTest: false, depthWrite: false }),
  )
  quad.frustumCulled = false
  const scene = new THREE.Scene()
  scene.add(quad)
  const camera = new THREE.OrthographicCamera()
  const paint = (gl) => {
    target.texture.anisotropy = gl.capabilities.getMaxAnisotropy()
    gl.setRenderTarget(target)
    gl.render(scene, camera)
    gl.setRenderTarget(null)
    quad.geometry.dispose()
    quad.material.dispose()
  }
  return { target, paint }
}

// the disk: horizontal slices, packed tightly near the plane where the thin disk and the dust
// are, and spread out above and below where only the bulge reaches. those outer slices only
// need to cover the bulge, so they are drawn small, which saves most of the fill cost
export function createDisk(map) {
  const full = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE)
  full.rotateX(-Math.PI / 2)
  const core = new THREE.PlaneGeometry(18, 18)
  core.rotateX(-Math.PI / 2)
  // [height, thickness it stands for], bottom to top
  const dy = (2 * DISK_SPAN) / DISK_SLICES
  const layers = Array.from({ length: DISK_SLICES }, (_, i) => [-DISK_SPAN + (i + 0.5) * dy, dy])
  BULGE_HEIGHTS.forEach((y, i) => {
    const below = i ? BULGE_HEIGHTS[i - 1] : DISK_SPAN
    const above = BULGE_HEIGHTS[i + 1] ?? y + (y - below)
    const step = (above - below) / 2
    layers.push([y, step])
    layers.unshift([-y, step])
  })
  const slices = []
  for (const [y, step] of layers) {
    const geometry = Math.abs(y) > DISK_SPAN ? core : full
    const material = new THREE.ShaderMaterial({
      vertexShader: sliceVertex,
      fragmentShader: sliceFragment,
      uniforms: {
        uMap: { value: map.target.texture },
        uY: { value: y },
        uStep: { value: step },
        uSpin: { value: 0 },
        uDust: { value: 1 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = y
    mesh.frustumCulled = false
    slices.push(mesh)
  }
  return { geometries: [full, core], slices }
}

// distant stars all around, far beyond the galaxy
export function createSky() {
  const rand = random(1977)
  const count = 6000
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const size = new Float32Array(count)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const y = rand() * 2 - 1
    const a = rand() * Math.PI * 2
    const q = Math.sqrt(1 - y * y)
    pos.set([1500 * q * Math.cos(a), 1500 * y, 1500 * q * Math.sin(a)], i * 3)
    const warm = rand() < 0.6
    const b = 0.35 + rand() * 0.6
    col.set(warm ? [b, b * 0.88, b * 0.75] : [b * 0.75, b * 0.85, b], i * 3)
    size[i] = 0.8 + Math.pow(rand(), 6) * 2.5
    seed[i] = rand()
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  const material = new THREE.ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: starFragment,
    uniforms: { uTime: { value: 0 }, uScale: { value: 1 } },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  points.renderOrder = -1
  return points
}

// HDR target the galaxy is drawn into, plus the full-screen pass that tone-maps it to the screen
export function createToneMap() {
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false })
  const material = new THREE.ShaderMaterial({
    vertexShader: toneVertex,
    fragmentShader: toneFragment,
    uniforms: { uScene: { value: target.texture }, uExposure: { value: 1.6 } },
    depthTest: false,
    depthWrite: false,
  })
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  quad.frustumCulled = false
  const scene = new THREE.Scene()
  scene.add(quad)
  return { target, material, scene, camera: new THREE.OrthographicCamera() }
}

// order the slices far to near for the camera, so nearer dust covers farther light
export function sortSlices(slices, cameraY) {
  const n = slices.length
  slices.forEach((mesh, i) => (mesh.renderOrder = cameraY >= 0 ? i : n - 1 - i))
}
