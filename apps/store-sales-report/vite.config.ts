import { federation } from '@module-federation/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'store_sales_report',
      filename: 'remoteEntry.js',
      manifest: true,
      exposes: {
        './vue': './src/ReportPlaceholder.vue',
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
