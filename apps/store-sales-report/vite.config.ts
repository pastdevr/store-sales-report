import { federation } from '@module-federation/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: fileURLToPath(new URL('../../packages/store-sales-api/public', import.meta.url)),
  plugins: [
    vue(),
    federation({
      name: 'store_sales_report',
      filename: 'remoteEntry.js',
      manifest: true,
      exposes: {
        './vue': './src/components/StoreSalesReport.vue',
      },
      shared: {
        vue: { singleton: true },
      },
    }),
  ],
  server: {
    port: 4174,
    strictPort: true,
  },
  preview: {
    port: 4174,
    strictPort: true,
  },
})
