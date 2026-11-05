export const salesCategories = [
  'beverages',
  'snacks',
  'tobacco',
  'grocery',
  'lottery',
  'household',
] as const

export const paymentMethods = ['cash', 'card', 'ebt', 'mobile'] as const

export type SalesCategory = (typeof salesCategories)[number]
export type PaymentMethod = (typeof paymentMethods)[number]

export interface SalesTransaction {
  id: string
  timestamp: string
  category: SalesCategory
  paymentMethod: PaymentMethod
  items: number
  total: number
}

export interface StoreSalesResponse {
  storeId: string
  currency: 'USD' | 'CAD'
  generatedAt: string
  transactions: SalesTransaction[]
}

export interface SalesDateRange {
  from: string
  to: string
}

export function getDefaultSalesRange(now = new Date()): SalesDateRange {
  const toDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const fromDate = new Date(toDate)
  fromDate.setUTCDate(fromDate.getUTCDate() - 29)

  return {
    from: formatDate(fromDate),
    to: formatDate(toDate),
  }
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}
