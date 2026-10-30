import { Suspense, lazy } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { journey, sceneFor } from '../lib/journey'
import { useTheme } from '../lib/theme'
import { setSoundProgress } from '../lib/sound'

const SpaceScene = lazy(() => import('./SpaceScene'))

// dark theme: Gargantua. galaxy theme: the Milky Way. light theme: the wormhole near Saturn.
export default function Background() {
  const [theme] = useTheme()
  const scene = sceneFor(theme)
  const { scrollY, scrollYProgress } = useScroll()
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    journey.progress = v
    setSoundProgress(v)
  })

  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const dim = useTransform(scrollY, [0, vh * 0.9], [0, 0.6])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-bg">
      <AnimatePresence initial={false}>
        <motion.div
          key={scene}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Suspense fallback={null}>
            <SpaceScene scene={scene} />
          </Suspense>
        </motion.div>
      </AnimatePresence>
      <motion.div style={{ opacity: dim }} className="absolute inset-0 bg-bg" />
      <div className="dot-grid absolute inset-0 opacity-40" />
    </div>
  )
}
