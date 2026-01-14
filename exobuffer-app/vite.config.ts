import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tauri } from 'vite-plugin-tauri'

export default defineConfig({
  plugins: [
    react(),
    tauri(),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    target: ['es2022', 'chrome115', 'safari17', 'edge115'],
  },
})
