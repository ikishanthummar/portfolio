import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { initLenis, startScroll, stopScroll } from './lib/scroll'
import Background from './components/Background'
import Comet from './components/Comet'
import Preloader from './components/Preloader'
import CommandMenu from './components/CommandMenu'
import MissionRail from './components/MissionRail'
import ControlDeck from './components/ControlDeck'
import EnduranceTop from './components/EnduranceTop'
import Hero from './components/Hero'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    const destroy = initLenis()
    stopScroll()
    return destroy
  }, [])

  const done = useCallback(() => {
    setLoading(false)
    startScroll()
  }, [])

  return (
    <div className="grain relative min-h-screen overflow-x-clip">
      <Background />
      <Comet />
      <CommandMenu />
      <AnimatePresence onExitComplete={() => setReady(true)}>{loading && <Preloader onDone={done} />}</AnimatePresence>

      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[65] h-[2px] origin-left bg-fg/70" />
      <main>
        <Hero ready={ready} />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <MissionRail ready={ready} />
      <ControlDeck ready={ready} />
      <EnduranceTop />
    </div>
  )
}
