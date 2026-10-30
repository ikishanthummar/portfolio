import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { pointer } from '../lib/pointer'
import { cameraAt, journey } from '../lib/journey'
import { SPIN, createDisk, createMap, createSky, createToneMap, sortSlices } from '../lib/galaxyModel'

// the Milky Way background (galaxy theme), on the same scroll keyframes as the shader scenes.
// the galaxy itself is built in lib/galaxyModel.js. it renders itself (useFrame priority 1 turns
// off the canvas's own render): into an HDR target first, then tone-mapped onto the screen

export default function Galaxy() {
  const progress = useRef(journey.progress)
  const clock = useRef(0)
  const look = useRef(new THREE.Vector2())
  const painted = useRef(false)
  const buffer = useMemo(() => new THREE.Vector2(), [])

  const map = useMemo(createMap, [])
  const disk = useMemo(() => createDisk(map), [map])
  const sky = useMemo(createSky, [])
  const tone = useMemo(createToneMap, [])
  useEffect(
    () => () => {
      map.target.dispose()
      tone.target.dispose()
      disk.geometries.forEach((g) => g.dispose())
      disk.slices.forEach((s) => s.material.dispose())
    },
    [map, disk, tone],
  )

  useFrame((state, dt) => {
    const { camera, size, gl, scene } = state
    if (!painted.current) {
      map.paint(gl)
      painted.current = true
    }

    progress.current = THREE.MathUtils.damp(progress.current, journey.progress, 4, dt)
    clock.current += dt
    look.current.x = THREE.MathUtils.damp(look.current.x, pointer.x, 2, dt)
    look.current.y = THREE.MathUtils.damp(look.current.y, pointer.y, 2, dt)

    // orbit the core at `dist`, looking at it
    const cam = cameraAt(progress.current, 'galaxy')
    const yaw = cam.yaw + look.current.x * 0.12 + Math.sin(clock.current * 0.05) * 0.03
    const pitch = cam.pitch + look.current.y * 0.04
    camera.position.set(
      -cam.dist * Math.cos(pitch) * Math.sin(yaw),
      cam.dist * Math.sin(pitch),
      -cam.dist * Math.cos(pitch) * Math.cos(yaw),
    )
    camera.lookAt(0, 0, 0)
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(0.5 / cam.fov))
    camera.near = 0.05
    camera.far = 5000
    // slide the galaxy sideways on screen, clear of the hero text (not on narrow screens)
    const shift = size.width < 768 ? 0 : cam.shift
    camera.setViewOffset(size.width, size.height, -shift * size.height, 0, size.width, size.height)
    camera.updateProjectionMatrix()

    gl.getDrawingBufferSize(buffer)
    sky.material.uniforms.uTime.value = clock.current
    sky.material.uniforms.uScale.value = buffer.y / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2))

    // spin the arms the way they trail; seen flatter, light and dust both pile up along each
    // line of sight, so ease the dust and the exposure the way a camera would
    const flat = THREE.MathUtils.smoothstep(Math.abs(pitch), 0.05, 0.7)
    sortSlices(disk.slices, camera.position.y)
    for (const slice of disk.slices) {
      slice.material.uniforms.uSpin.value = -clock.current * SPIN
      slice.material.uniforms.uDust.value = 0.45 + 0.55 * flat
    }
    tone.material.uniforms.uExposure.value = 1.3 + 1.5 * flat

    if (tone.target.width !== buffer.x || tone.target.height !== buffer.y) tone.target.setSize(buffer.x, buffer.y)
    gl.setRenderTarget(tone.target)
    gl.render(scene, camera)
    gl.setRenderTarget(null)
    gl.render(tone.scene, tone.camera)
  }, 1)

  return (
    <>
      <color attach="background" args={['#020309']} />
      <primitive object={sky} />
      {disk.slices.map((slice, i) => (
        <primitive key={i} object={slice} />
      ))}
    </>
  )
}
