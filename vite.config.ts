/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Artha/',
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/stock-feed': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stock-feed/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    css: true,
  },
})
