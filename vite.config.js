import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/rest': {
        target: 'https://6ce3-164-52-202-62.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
