import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // важно для Docker
    port: 5173,
    watch: {
      usePolling: true, // важно для Docker в Windows
    },
    proxy: {
      '/api': {
        target: 'http://backend:8000', // внутри Docker сети
        changeOrigin: true,
        secure: false,
      }
    }
  }
})