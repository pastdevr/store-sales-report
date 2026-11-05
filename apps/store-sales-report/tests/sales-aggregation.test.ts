import { describe, expect, it } from 'vitest'
import type { SalesTransaction } from '@store-sales-report/data'
import { aggregateSales, isValidDateRange } from '../src/utils/sales-aggregation'

const transactions: SalesTransaction[] = [
  { id: 'T-1', timestamp: '2026-10-01T08:00:00.000Z', category: 'beverages', paymentMethod: 'card', items: 3, total: 12.47 },
  { id: 'T-2', timestamp: '2026-10-01T12:00:00.000Z', category: 'snacks', paymentMethod: 'cash', items: 2, total: 4.5 },
  { id: 'T-3', timestamp: '2026-10-02T08:00:00.000Z', category: 'beverages', paymentMethod: 'card', items: 1, total: 7.03 },
  { id: 'T-4', timestamp: '2026-10-03T08:00:00.000Z', category: 'lottery', paymentMethod: 'ebt', items: 1, total: 2.25 },
]

describe('aggregateSales', () => {
  it('calculates all report metrics and daily revenue for the selected date range', () => {
    const result = aggregateSales(transactions, {
      from: '2026-10-01',
      to: '2026-10-02',
      paymentMethod: 'all',
    })

    expect(result.metrics).toEqual({
      revenue: 24,
      transactionCount: 3,
      averageBasketValue: 8,
      itemsSold: 6,
    })
    expect(result.dailyRevenue).toEqual([
      { date: '2026-10-01', revenue: 16.97 },
      { date: '2026-10-02', revenue: 7.03 },
    ])
    expect(result.categories.find(({ category }) => category === 'beverages')).toEqual({
      category: 'beverages',
      revenue: 19.5,
      transactionCount: 2,
      itemsSold: 4,
    })
  })

  it('applies the payment filter to KPIs, chart totals, and categories', () => {
    const result = aggregateSales(transactions, {
      from: '2026-10-01',
      to: '2026-10-03',
      paymentMethod: 'card',
    })

    expect(result.metrics).toEqual({
      revenue: 19.5,
      transactionCount: 2,
      averageBasketValue: 9.75,
      itemsSold: 4,
    })
    expect(result.dailyRevenue.map(({ revenue }) => revenue)).toEqual([12.47, 7.03, 0])
    expect(result.categories.find(({ category }) => category === 'snacks')?.revenue).toBe(0)
  })

  it('returns zeroed categories and daily totals when nothing matches', () => {
    const result = aggregateSales([], {
      from: '2026-10-01',
      to: '2026-10-01',
      paymentMethod: 'all',
    })

    expect(result.metrics).toEqual({ revenue: 0, transactionCount: 0, averageBasketValue: 0, itemsSold: 0 })
    expect(result.dailyRevenue).toEqual([{ date: '2026-10-01', revenue: 0 }])
    expect(result.categories).toHaveLength(6)
    expect(result.categories.every(({ revenue, transactionCount }) => revenue === 0 && transactionCount === 0)).toBe(true)
  })
})

describe('isValidDateRange', () => {
  it('accepts valid inclusive ranges and rejects malformed or reversed ranges', () => {
    expect(isValidDateRange('2026-10-01', '2026-10-01')).toBe(true)
    expect(isValidDateRange('2026-10-01', '2026-10-30')).toBe(true)
    expect(isValidDateRange('2026-10-30', '2026-10-01')).toBe(false)
    expect(isValidDateRange('2026-02-30', '2026-03-01')).toBe(false)
    expect(isValidDateRange('', '2026-10-01')).toBe(false)
  })
})
