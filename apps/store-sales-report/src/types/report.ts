export type ReportLocale = 'en' | 'es' | 'fr'
export type ReportTheme = 'light' | 'dark'
export type ReportPaymentMethod = 'cash' | 'card' | 'ebt' | 'mobile'
export type ReportCategory = 'beverages' | 'snacks' | 'tobacco' | 'grocery' | 'lottery' | 'household'
export type PaymentFilter = ReportPaymentMethod | 'all'
export type ReportNoticeState = 'loading' | 'error' | 'empty' | 'invalid' | 'configuration'

export interface StoreSalesReportProps {
  storeId: string
  language?: ReportLocale
  from?: string
  to?: string
  theme?: ReportTheme
}

export interface ReportFilters {
  from: string
  to: string
  paymentMethod: PaymentFilter
}

export interface SalesMetrics {
  revenue: number
  transactionCount: number
  averageBasketValue: number
  itemsSold: number
}

export interface CategoryRevenue {
  category: ReportCategory
  revenue: number
  transactionCount: number
  itemsSold: number
}

export interface DailyRevenue {
  date: string
  revenue: number
}

export interface LoadErrorDetail {
  storeId: string
  message: string
  status?: number
}

export interface StoreSalesReportDataLoadedDetail {
  storeId: string
  currency: 'USD' | 'CAD'
  generatedAt: string
  transactions: Array<{
    id: string
    timestamp: string
    category: ReportCategory
    paymentMethod: ReportPaymentMethod
    items: number
    total: number
  }>
}

export type StoreSalesReportEventDetails = {
  'data-loaded': StoreSalesReportDataLoadedDetail
  'load-error': LoadErrorDetail
  'filters-change': ReportFilters
}

/** Vue component emit signature: event name to tuple of emitted arguments. */
export interface StoreSalesReportEmits {
  'data-loaded': [detail: StoreSalesReportDataLoadedDetail]
  'load-error': [detail: LoadErrorDetail]
  'filters-change': [filters: ReportFilters]
}

/** Vue's public component declaration uses handler signatures rather than macro tuples. */
export type StoreSalesReportVueEmits = {
  [EventName in keyof StoreSalesReportEventDetails]: (detail: StoreSalesReportEventDetails[EventName]) => void
}
