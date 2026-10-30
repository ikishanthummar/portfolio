import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  // The three.js scene is lazy-loaded into its own ~900 kB chunk.
  build: { chunkSizeWarningLimit: 1000 },
})
