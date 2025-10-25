// Vite configuration for static HTML/CSS/JS project
import { defineConfig } from 'vite'
import { componentTagger } from 'lovable-tagger'

export default defineConfig(({ mode }) => ({
  base: './', // ensure relative paths work after build
  root: '.',
  server: {
    host: '::',
    port: 8080,
    open: false,
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
  },
}))
