import type { DefineComponent } from 'vue'

export type ReportLocale = 'en' | 'es' | 'fr'
export type ReportTheme = 'light' | 'dark'

export interface StoreSalesReportProps {
  storeId: string
  language?: ReportLocale
  from?: string
  to?: string
  theme?: ReportTheme
}

declare const StoreSalesReport: DefineComponent<StoreSalesReportProps>

export default StoreSalesReport
