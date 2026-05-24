import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === 'build' ? '/ai-content-studio/' : '/',
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
}))
