// mouse position normalised to -1..1
export const pointer = { x: 0, y: 0 }

if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
  })
}
