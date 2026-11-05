import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: fileURLToPath(new URL('../../', import.meta.url)),
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: [
      'apps/store-sales-report/tests/**/*.test.ts',
      'packages/store-sales-api/tests/**/*.test.ts',
    ],
    setupFiles: ['apps/store-sales-report/tests/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
  },
})
