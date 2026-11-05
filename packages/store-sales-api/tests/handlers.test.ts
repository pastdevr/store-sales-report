// @vitest-environment node
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { getDefaultSalesRange } from '../src/sales'
import { handlers } from '../src/handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  vi.restoreAllMocks()
})
afterAll(() => server.close())

function salesUrl(storeId: string, from: string, to: string): string {
  const params = new URLSearchParams({ from, to })
  return `http://localhost/api/stores/${storeId}/sales?${params}`
}

describe('store sales mock API contracts', () => {
  it('returns USD and CAD payloads with about two thousand total transactions', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.2)
    const { from, to } = getDefaultSalesRange()
    const [usdResponse, cadResponse] = await Promise.all([
      fetch(salesUrl('S-1042', from, to)),
      fetch(salesUrl('S-2048', from, to)),
    ])
    const [usd, cad] = await Promise.all([usdResponse.json(), cadResponse.json()]) as Array<{
      storeId: string
      currency: string
      generatedAt: string
      transactions: Array<{ id: string; timestamp: string; category: string; paymentMethod: string; items: number; total: number }>
    }>

    expect(usdResponse.status).toBe(200)
    expect(cadResponse.status).toBe(200)
    expect(usd).toMatchObject({ storeId: 'S-1042', currency: 'USD' })
    expect(cad).toMatchObject({ storeId: 'S-2048', currency: 'CAD' })
    expect(Number.isNaN(Date.parse(usd.generatedAt))).toBe(false)
    expect(usd.transactions.length + cad.transactions.length).toBe(2_000)
    expect(usd.transactions[0]).toMatchObject({ category: expect.any(String), paymentMethod: expect.any(String) })
    expect(usd.transactions.every((transaction) => Number.isInteger(transaction.items)
      && Math.abs(transaction.total * 100 - Math.round(transaction.total * 100)) < 1e-8)).toBe(true)
  })

  it('filters inclusively by both dates', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.2)
    const { from, to } = getDefaultSalesRange()
    const fullResponse = await fetch(salesUrl('S-1042', from, to))
    const fullData = await fullResponse.json() as { transactions: Array<{ id: string; timestamp: string }> }
    const transaction = fullData.transactions[0]
    const day = transaction.timestamp.slice(0, 10)
    const dayResponse = await fetch(salesUrl('S-1042', day, day))
    const dayData = await dayResponse.json() as { transactions: Array<{ id: string; timestamp: string }> }

    expect(dayResponse.status).toBe(200)
    expect(dayData.transactions.length).toBeGreaterThan(0)
    expect(dayData.transactions.some(({ id }) => id === transaction.id)).toBe(true)
    expect(dayData.transactions.every(({ timestamp }) => timestamp.slice(0, 10) === day)).toBe(true)
  })

  it('returns 400 for invalid dates and 404 for unknown stores', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.2)
    const [invalidRange, unknownStore] = await Promise.all([
      fetch(salesUrl('S-1042', '2026-02-30', '2026-03-01')),
      fetch(salesUrl('S-9999', '2026-10-01', '2026-10-02')),
    ])

    expect(invalidRange.status).toBe(400)
    expect(unknownStore.status).toBe(404)
  })

  it('returns a retryable server error in its simulated failure case', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.05)
    const { from, to } = getDefaultSalesRange()
    const response = await fetch(salesUrl('S-1042', from, to))
    const body = await response.json() as { message: string }

    expect(response.status).toBe(500)
    expect(body.message).toContain('failed')
  })
})
