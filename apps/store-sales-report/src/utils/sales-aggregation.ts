import {
  salesCategories,
  type PaymentMethod,
  type SalesTransaction,
} from '@store-sales-report/data'
import type {
  CategoryRevenue,
  DailyRevenue,
  PaymentFilter,
  ReportFilters,
  SalesMetrics,
} from '../types/report'

export interface AggregatedSales {
  transactions: SalesTransaction[]
  metrics: SalesMetrics
  categories: CategoryRevenue[]
  dailyRevenue: DailyRevenue[]
}

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

function datesBetween(from: string, to: string): string[] {
  const start = Date.parse(`${from}T00:00:00.000Z`)
  const end = Date.parse(`${to}T00:00:00.000Z`)
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) return []

  const dates: string[] = []
  for (let current = start; current <= end; current += 86_400_000) {
    dates.push(new Date(current).toISOString().slice(0, 10))
  }
  return dates
}

export function aggregateSales(
  source: readonly SalesTransaction[],
  filters: Pick<ReportFilters, 'from' | 'to' | 'paymentMethod'>,
): AggregatedSales {
  const inRange = source.filter((transaction) => {
    const date = transaction.timestamp.slice(0, 10)
    return date >= filters.from && date <= filters.to
  })
  const transactions = filters.paymentMethod === 'all'
    ? inRange
    : inRange.filter((transaction) => transaction.paymentMethod === filters.paymentMethod)

  const revenue = roundMoney(transactions.reduce((total, transaction) => total + transaction.total, 0))
  const metrics: SalesMetrics = {
    revenue,
    transactionCount: transactions.length,
    averageBasketValue: transactions.length ? roundMoney(revenue / transactions.length) : 0,
    itemsSold: transactions.reduce((total, transaction) => total + transaction.items, 0),
  }

  const categories: CategoryRevenue[] = salesCategories.map((category) => {
    const categoryTransactions = transactions.filter((transaction) => transaction.category === category)
    return {
      category,
      revenue: roundMoney(categoryTransactions.reduce((total, transaction) => total + transaction.total, 0)),
      transactionCount: categoryTransactions.length,
      itemsSold: categoryTransactions.reduce((total, transaction) => total + transaction.items, 0),
    }
  })

  const dailyTotals = new Map<string, number>()
  for (const transaction of transactions) {
    const date = transaction.timestamp.slice(0, 10)
    dailyTotals.set(date, (dailyTotals.get(date) ?? 0) + transaction.total)
  }
  const dailyRevenue = datesBetween(filters.from, filters.to).map((date) => ({
    date,
    revenue: roundMoney(dailyTotals.get(date) ?? 0),
  }))

  return { transactions, metrics, categories, dailyRevenue }
}

export function isPaymentFilter(value: string): value is PaymentFilter {
  return value === 'all' || ['cash', 'card', 'ebt', 'mobile'].includes(value)
}

export function isPaymentMethod(value: string): value is PaymentMethod {
  return ['cash', 'card', 'ebt', 'mobile'].includes(value)
}

export function isValidDateRange(from: string, to: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return false
  const fromDate = new Date(`${from}T00:00:00.000Z`)
  const toDate = new Date(`${to}T00:00:00.000Z`)
  if (!Number.isFinite(fromDate.valueOf()) || !Number.isFinite(toDate.valueOf())) return false
  return fromDate.toISOString().slice(0, 10) === from
    && toDate.toISOString().slice(0, 10) === to
    && fromDate <= toDate
}
