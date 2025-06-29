
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        landing: 'public/index.html',
        login: 'public/login.html',
        register: 'public/register.html',
        dashboard: 'public/dashboard.html'
      }
    }
  }
})
