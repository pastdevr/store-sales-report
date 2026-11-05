import type { PaymentMethod, SalesCategory } from '@store-sales-report/data'

export type ReportLocale = 'en' | 'es' | 'fr'
export type ReportTheme = 'light' | 'dark'
export type PaymentFilter = PaymentMethod | 'all'

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
  category: SalesCategory
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
