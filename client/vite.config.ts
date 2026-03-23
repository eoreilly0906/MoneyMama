import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = 'http://localhost:3000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': { target: apiTarget, changeOrigin: true },
      '/subscriptions': { target: apiTarget, changeOrigin: true },
      '/health': { target: apiTarget, changeOrigin: true },
    },
  },
})
