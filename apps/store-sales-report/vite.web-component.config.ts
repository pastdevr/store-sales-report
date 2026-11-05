import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist-web-component',
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/web-component.ts'),
      formats: ['es'],
      fileName: 'store-sales-report',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
