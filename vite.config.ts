import path from 'path'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  root: path.resolve(__dirname, 'src/settings'),
  plugins: [solidPlugin()],
  server: {
    port: 3000
  },
  build: {
    target: 'esnext',
    outDir: path.resolve(__dirname, 'dist/all')
  }
})