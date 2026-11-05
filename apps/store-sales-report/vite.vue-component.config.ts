import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist-vue',
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/vue-entry.ts'),
      formats: ['es'],
      fileName: 'store-sales-report',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
