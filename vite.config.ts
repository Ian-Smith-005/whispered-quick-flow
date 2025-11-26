// Vite configuration for static HTML/CSS/JS project
import { defineConfig } from 'vite'
import { componentTagger } from 'lovable-tagger'
import path from 'path'

export default defineConfig(({ mode }) => ({
  base: './', // ensure relative paths work after build
  root: '.',
  server: {
    host: '::',
    port: 8080,
    open: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  preview: {
    port: 5174,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        about: path.resolve(__dirname, 'about-us.html'),
        services: path.resolve(__dirname, 'ai-services.html'),
        contact: path.resolve(__dirname, 'contact-us.html'),
        login: path.resolve(__dirname, 'login.html'),
        register: path.resolve(__dirname, 'register.html'),
        dashboard: path.resolve(__dirname, 'dashboard.html'),
      },
    },
  },
}))
