/// <reference types="vite/client" />

declare module 'storeSalesReport/vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{
    storeId: string
    language?: 'en' | 'es' | 'fr'
    from?: string
    to?: string
    theme?: 'light' | 'dark'
  }>
  export default component
}
