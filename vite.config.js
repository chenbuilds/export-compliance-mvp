import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/agent': 'http://127.0.0.1:5001',
      '/chat': 'http://127.0.0.1:5001',
      '/evaluate': 'http://127.0.0.1:5001',
      '/screen-dps': 'http://127.0.0.1:5001',
      '/screen-uflpa': 'http://127.0.0.1:5001',
      '/email-status': 'http://127.0.0.1:5001',
      '/send-email': 'http://127.0.0.1:5001'
    }
  }
})
