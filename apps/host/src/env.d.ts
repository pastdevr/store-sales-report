/// <reference types="vite/client" />

declare module 'storeSalesReport/vue' {
  import type { DefineComponent } from 'vue'
  import type {
    StoreSalesReportProps,
    StoreSalesReportVueEmits,
  } from '@store-sales-report/widget/vue'

  const component: DefineComponent<
    StoreSalesReportProps,
    {},
    {},
    {},
    {},
    {},
    {},
    StoreSalesReportVueEmits
  >
  export default component
}
