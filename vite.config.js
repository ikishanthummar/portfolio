import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages serves the site from /portfolio/ (set by the deploy workflow); Netlify and
  // local dev serve it from the root
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  server: { port: 5173 },
  // The three.js scene is lazy-loaded into its own ~900 kB chunk.
  build: { chunkSizeWarningLimit: 1000 },
})
