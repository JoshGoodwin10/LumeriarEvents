import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // 👈 Choose either this line or the babel setup – don't use both
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // the address of your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})