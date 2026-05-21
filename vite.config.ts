import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'index.html'),
        marketing: resolve(__dirname, 'marketing.html'),
      },
    },
  },
})
