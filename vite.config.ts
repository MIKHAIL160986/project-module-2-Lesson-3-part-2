import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Сборка в один index.html: так приложение открывается с диска (file://) без белого экрана.
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    ...(command === 'build'
      ? [viteSingleFile({ removeViteModuleLoader: true })]
      : []),
  ],
  base: './',
  build: {
    outDir: 'preview',
    emptyOutDir: true,
  },
}))
