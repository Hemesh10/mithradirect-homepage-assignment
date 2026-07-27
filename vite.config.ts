import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/home': {
        target: 'https://subscriptionapp-wgf8.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/home/, '/api/v1/home'),
      },
    },
  },
  preview: {
    proxy: {
      '/api/home': {
        target: 'https://subscriptionapp-wgf8.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/home/, '/api/v1/home'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    restoreMocks: true,
  },
})
