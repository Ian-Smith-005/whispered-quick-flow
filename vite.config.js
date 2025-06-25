
import { defineConfig } from 'vite'
import React from '@vitejs/plugin-react'
import path from 'path'
import { componentTagger } from "lovable-tagger"
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [
    React(),
    componentTagger(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  server: {
    port: 8080,
    host: true
  },
  // Serve static HTML files from public directory
  publicDir: 'public',
})
