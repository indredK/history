import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['axios'],
  },
  define: {
    'import.meta.env.VITE_DATA_SOURCE': JSON.stringify(process.env.VITE_DATA_SOURCE || 'mock'),
    'import.meta.env.VITE_MOCK_ERROR_RATE': JSON.stringify(process.env.VITE_MOCK_ERROR_RATE || '0'),
  },
})
