


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
   base: './',
  server: {
    open: true,
    port: 3001
  },
      fastRefresh: true,
  server: {
  proxy: {
    '/api': {
        target: 'https://backend-21-2fu1.onrender.com',
      changeOrigin: true,
      secure: false,
      
      
    }
  }
}
});



