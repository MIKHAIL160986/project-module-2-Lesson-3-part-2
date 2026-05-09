import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Сборка в один index.html: так приложение открывается с диска (file://) без белого экрана.
// outDir docs/ — типичный источник GitHub Pages (Settings → Pages → Branch main, folder /docs).
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    ...(command === 'build'
      ? [
          viteSingleFile({ removeViteModuleLoader: true }),
          {
            name: 'github-pages-nojekyll',
            closeBundle() {
              writeFileSync(resolve(process.cwd(), 'docs', '.nojekyll'), '')
            },
          },
        ]
      : []),
  ],
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
}))
