import { federation } from '@module-federation/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    publicDir: fileURLToPath(new URL('../../packages/store-sales-api/public', import.meta.url)),
    plugins: [
      vue(),
      federation({
        name: 'store_sales_report_host',
        remotes: {
          storeSalesReport: {
            type: 'module',
            name: 'store_sales_report',
            entry: env.VITE_STORE_SALES_REMOTE_ENTRY || 'http://localhost:4174/mf-manifest.json',
          },
        },
        shared: {
          vue: { singleton: true },
        },
      }),
    ],
    server: {
      port: 5173,
      strictPort: true,
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
  }
})
