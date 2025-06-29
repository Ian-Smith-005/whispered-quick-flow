
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { componentTagger } from "lovable-tagger"

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
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
}))
