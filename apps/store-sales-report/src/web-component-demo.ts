import { startMockApi } from '@store-sales-report/data/browser'
import type { StoreSalesReportEventDetails } from './types/report'

const widget = document.querySelector('store-sales-report')
const output = document.querySelector<HTMLOutputElement>('#widget-events')

widget?.addEventListener('data-loaded', (event) => {
  const detail = (event as CustomEvent<StoreSalesReportEventDetails['data-loaded']>).detail
  if (output) output.value = `${detail.transactions.length} transactions loaded for ${detail.storeId}.`
})
widget?.addEventListener('load-error', (event) => {
  const detail = (event as CustomEvent<StoreSalesReportEventDetails['load-error']>).detail
  if (output) output.value = detail.message
})

await startMockApi()
await import('./web-component')
