// Vite configuration for static HTML/CSS/JS project
import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // ensure relative paths work after build
  root: '.',
  server: {
    port: 8080,
    open: false,
  },
  preview: {
    port: 5174,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
  },
})
