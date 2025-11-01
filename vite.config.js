import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const root = process.cwd()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    fs: {
      // Restrict file serving to the project root only
      allow: [root],
      // Deny common sensitive patterns
      deny: ['..', '/**/*.env', '/**/.*', 'node_modules']
    }
  }
})
