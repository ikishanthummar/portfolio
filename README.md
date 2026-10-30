# kishan-portfolio

My personal portfolio, themed on Interstellar. In dark mode the background is a real-time black hole (Gargantua), in galaxy mode it is the Milky Way as a 3D cloud of ~150k stars, and in light mode it is the wormhole near Saturn. The black hole and wormhole are fragment shaders; the galaxy is point sprites rendered in HDR and tone-mapped. Scrolling the page moves the camera toward each one until you reach the event horizon / the galactic disk / the throat at the contact section.

## Stack

- React 18 + Vite
- Tailwind CSS
- three.js / @react-three/fiber for the background shader
- Framer Motion for UI animation
- Lenis for smooth scrolling

## Running locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

The output goes to `dist/`, which can be dropped onto any static host (Netlify, Vercel, GitHub Pages).

Before deploying, set `VITE_SITE_URL` in `.env` to the real domain and rebuild. Link previews on LinkedIn / WhatsApp / X use `public/og-image.png` and need that absolute URL.

## Project layout

```
src/
  data.js            all the content: profile, skills, experience, projects
  components/
    SpaceScene.jsx   full-screen shader canvas (adaptive resolution)
    Background.jsx   picks the scene for the current theme
    Comet.jsx        cursor trail, click ripple, chip "gravity"
    Hero.jsx         landing screen and overview tiles
    MissionRail.jsx  section nav drawn as a trajectory toward the black hole
    ControlDeck.jsx  sound / theme / search / resume buttons
    EnduranceTop.jsx back-to-top button (the Endurance from Interstellar)
    CommandMenu.jsx  Ctrl/Cmd + K menu
    ...              one file per section
  shaders/
    blackhole.js     ray-marched Schwarzschild black hole
    wormhole.js      wormhole ray tracer (Interstellar metric) over a bright nebula
    galaxy.js        point-sprite and tone-map shaders for the Milky Way (built in lib/galaxyModel.js)
    common.js        shared noise, stars and camera code
  lib/
    journey.js       camera keyframes tied to scroll position
    scroll.js        Lenis setup and scroll helpers
    theme.js         dark / galaxy / light toggle
```

To update the content, edit `src/data.js`. Nothing else needs to change.

## Notes

- The shader runs at the display refresh rate (60/120/144hz) and lowers its resolution if the GPU can't keep up.
- Light mode shows the wormhole instead of the black hole, galaxy mode the Milky Way. The theme button cycles dark → galaxy → light.
- Sound starts when you press "Begin mission" (browsers need a click before audio). The ambient score is generated live with the Web Audio API (`src/lib/sound.js`), there are no audio files.
- Effects respect `prefers-reduced-motion`.
