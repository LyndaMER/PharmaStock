import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,          // port de dev
    strictPort: false,   // si 5173 est pris, Vite choisira 5174, etc.
    proxy: {
      // toutes les requêtes commençant par /api seront
      // redirigées vers ton backend local (Express)
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
  },
})
