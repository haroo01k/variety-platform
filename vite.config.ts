import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { serviceWorkerPlugin } from './pwa/serviceWorkerPlugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), serviceWorkerPlugin()],
  server: {
    allowedHosts: ['.loca.lt', '.trycloudflare.com'],
  },
  preview: {
    allowedHosts: ['.loca.lt', '.trycloudflare.com'],
  },
})
