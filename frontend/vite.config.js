// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // Переменные окружения для клиента
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
  }
})