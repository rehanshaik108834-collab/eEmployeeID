import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Production-friendly Vite configuration (safe, minimal changes)
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  // Opt for modern JS target to reduce polyfills and bundle size
  build: {
    target: 'es2018',
    minify: 'esbuild',
    sourcemap: false,
    brotliSize: false,
    // Smaller chunk size warning threshold
    chunkSizeWarningLimit: 600,
  },
  // Prevent exposing server overlay for HMR in production
  server: {
    hmr: { overlay: mode === 'development' },
    // Enable SPA fallback for client-side routing (handles page reloads in dev)
    historyApiFallback: true
  },
  preview: {
    // Also enable for preview mode
    historyApiFallback: true
  }
}))
