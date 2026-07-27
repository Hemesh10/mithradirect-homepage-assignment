import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Mirrors the Vercel `api/home.ts` function during local dev and preview so the
// app always talks to the same-origin `/api/home` path.
const homeApiProxy = {
  '/api/home': {
    target: 'https://subscriptionapp-wgf8.onrender.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/home/, '/api/v1/home'),
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy: homeApiProxy },
  preview: { proxy: homeApiProxy },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    restoreMocks: true,
  },
})
