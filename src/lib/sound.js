import { useEffect, useState } from 'react'

// ambient score, all synthesised with Web Audio (no audio files).
// organ drone + chord pads + chimes + clock tick + space hum, through a generated reverb.

let ctx = null
let graph = null
let enabled = false
let progress = 0
let timers = []
const listeners = new Set()

const CHORDS = [
  [220.0, 261.63, 329.63, 440.0], // Am
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [196.0, 261.63, 329.63, 392.0], // C/G
  [196.0, 246.94, 293.66, 392.0], // G
]
const CHIMES = [880, 1046.5, 1318.5, 1760]

const setState = (on) => {
  enabled = on
  try {
    localStorage.setItem('sound', on ? 'on' : 'off')
  } catch (e) {}
  listeners.forEach((fn) => fn(on))
}

function reverbImpulse(seconds = 4.5, decay = 3) {
  const length = ctx.sampleRate * seconds
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay
  }
  return buffer
}

function brownNoise(seconds = 4) {
  const length = ctx.sampleRate * seconds
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
    data[i] = last * 3.5
  }
  return buffer
}

function build() {
  ctx = new (window.AudioContext || window.webkitAudioContext)()

  const master = ctx.createGain()
  master.gain.value = 0
  const limiter = ctx.createDynamicsCompressor()
  master.connect(limiter).connect(ctx.destination)

  const reverb = ctx.createConvolver()
  reverb.buffer = reverbImpulse()
  const wet = ctx.createGain()
  wet.gain.value = 0.6
  reverb.connect(wet).connect(master)
  const dry = ctx.createGain()
  dry.gain.value = 0.55
  dry.connect(master)

  // a channel that feeds both the dry signal and the reverb
  const channel = (level, send = 1) => {
    const g = ctx.createGain()
    g.gain.value = level
    g.connect(dry)
    const s = ctx.createGain()
    s.gain.value = send
    g.connect(s).connect(reverb)
    return g
  }

  // pipe organ: a few soft harmonics on top of the fundamental
  const organ = ctx.createPeriodicWave(new Float32Array(8), Float32Array.from([0, 1, 0.55, 0.32, 0.22, 0.1, 0.07, 0.04]))

  const drone = channel(0.1)
  for (const [freq, level] of [
    [55, 0.5],
    [110, 0.28],
    [164.81, 0.18],
  ]) {
    const osc = ctx.createOscillator()
    osc.setPeriodicWave(organ)
    osc.frequency.value = freq
    osc.detune.value = (Math.random() - 0.5) * 6
    const g = ctx.createGain()
    g.gain.value = level
    osc.connect(g).connect(drone)
    osc.start()
  }
  const swell = ctx.createOscillator()
  swell.frequency.value = 0.06
  const swellDepth = ctx.createGain()
  swellDepth.gain.value = 0.03
  swell.connect(swellDepth).connect(drone.gain)
  swell.start()

  const padFilter = ctx.createBiquadFilter()
  padFilter.type = 'lowpass'
  padFilter.frequency.value = 700
  padFilter.Q.value = 0.4
  const pad = channel(0.9)
  padFilter.connect(pad)

  const hum = channel(0.15, 0.3)
  const noise = ctx.createBufferSource()
  noise.buffer = brownNoise()
  noise.loop = true
  const humFilter = ctx.createBiquadFilter()
  humFilter.type = 'lowpass'
  humFilter.frequency.value = 160
  noise.connect(humFilter).connect(hum)
  noise.start()

  const chimes = channel(0.5, 1.6)
  const ticks = channel(0.04, 0.5)
  const fx = channel(0.7, 0.8)

  graph = { master, organ, drone, padFilter, hum, chimes, ticks, fx, noiseBuffer: noise.buffer }
}

function playChord(index) {
  const now = ctx.currentTime
  for (const freq of CHORDS[index % CHORDS.length]) {
    for (const detune of [-4, 4]) {
      const osc = ctx.createOscillator()
      osc.setPeriodicWave(graph.organ)
      osc.frequency.value = freq
      osc.detune.value = detune
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, now)
      g.gain.linearRampToValueAtTime(0.045, now + 3)
      g.gain.setValueAtTime(0.045, now + 8)
      g.gain.linearRampToValueAtTime(0, now + 12)
      osc.connect(g).connect(graph.padFilter)
      osc.start(now)
      osc.stop(now + 12.5)
    }
  }
}

function playChime() {
  if (Math.random() > 0.6) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = CHIMES[(Math.random() * CHIMES.length) | 0]
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, now)
  g.gain.linearRampToValueAtTime(0.05, now + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 3.5)
  osc.connect(g).connect(graph.chimes)
  osc.start(now)
  osc.stop(now + 3.6)
}

function noiseBurst(target, { duration, filterType, frequency, level }) {
  const now = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = graph.noiseBuffer
  const filter = ctx.createBiquadFilter()
  filter.type = filterType
  filter.frequency.value = frequency
  const g = ctx.createGain()
  g.gain.setValueAtTime(level, now)
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  src.connect(filter).connect(g).connect(target)
  src.start(now, Math.random() * 2)
  src.stop(now + duration + 0.05)
}

// the clock: one tick every 1.25s
const playTick = () => noiseBurst(graph.ticks, { duration: 0.04, filterType: 'highpass', frequency: 2500, level: 1 })

function startTimers() {
  let chord = 0
  playChord(chord++)
  timers = [
    setInterval(() => playChord(chord++), 8000),
    setInterval(playChime, 2600),
    setInterval(playTick, 1250),
  ]
}

function stopTimers() {
  timers.forEach(clearInterval)
  timers = []
}

export function setSoundProgress(p) {
  progress = p
  if (!graph) return
  const t = ctx.currentTime
  graph.padFilter.frequency.setTargetAtTime(600 + p * 2600, t, 0.6)
  graph.drone.gain.setTargetAtTime(0.1 + p * 0.12, t, 0.6)
  graph.hum.gain.setTargetAtTime(0.15 + p * 0.4, t, 0.6)
  graph.ticks.gain.setTargetAtTime(0.03 + p * 0.3, t, 0.6)
}

export function enableSound() {
  if (enabled) return
  if (!ctx) build()
  ctx.resume()
  setSoundProgress(progress)
  startTimers()
  graph.master.gain.cancelScheduledValues(ctx.currentTime)
  graph.master.gain.setTargetAtTime(0.7, ctx.currentTime, 0.8)
  setState(true)
}

export function disableSound() {
  if (!enabled) return
  stopTimers()
  graph.master.gain.cancelScheduledValues(ctx.currentTime)
  graph.master.gain.setTargetAtTime(0, ctx.currentTime, 0.25)
  setState(false)
  setTimeout(() => !enabled && ctx.suspend(), 1500)
}

export const toggleSound = () => (enabled ? disableSound() : enableSound())

// low thump that falls in pitch, panned toward where you clicked
export function playShockwave(pan = 0) {
  if (!enabled) return
  const now = ctx.currentTime
  const panner = ctx.createStereoPanner()
  panner.pan.value = Math.max(-1, Math.min(1, pan))
  panner.connect(graph.fx)
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(95, now)
  osc.frequency.exponentialRampToValueAtTime(32, now + 0.6)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.55, now)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7)
  osc.connect(g).connect(panner)
  osc.start(now)
  osc.stop(now + 0.75)
  noiseBurst(panner, { duration: 0.45, filterType: 'lowpass', frequency: 500, level: 0.35 })
}

// rising mechanical whine for the Endurance docking spin
export function playDocking() {
  if (!enabled) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(55, now)
  osc.frequency.exponentialRampToValueAtTime(330, now + 1.1)
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 6
  filter.frequency.setValueAtTime(200, now)
  filter.frequency.exponentialRampToValueAtTime(1400, now + 1.1)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, now)
  g.gain.linearRampToValueAtTime(0.12, now + 0.3)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 1.4)
  osc.connect(filter).connect(g).connect(graph.fx)
  osc.start(now)
  osc.stop(now + 1.5)

  const chime = ctx.createOscillator()
  chime.frequency.value = 880
  const cg = ctx.createGain()
  cg.gain.setValueAtTime(0, now + 1.1)
  cg.gain.linearRampToValueAtTime(0.08, now + 1.12)
  cg.gain.exponentialRampToValueAtTime(0.0001, now + 3)
  chime.connect(cg).connect(graph.chimes)
  chime.start(now + 1.1)
  chime.stop(now + 3.1)
}

export function useSound() {
  const [on, setOn] = useState(enabled)
  useEffect(() => {
    listeners.add(setOn)
    return () => listeners.delete(setOn)
  }, [])
  return [on, toggleSound]
}
