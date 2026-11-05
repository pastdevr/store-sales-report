import { delay, http, HttpResponse } from 'msw'
import { mockStores, mockTransactionsByStore } from './mock-data'
import { type StoreSalesResponse } from './sales'

const storeIds = new Set<string>(mockStores.map(({ storeId }) => storeId))

function isValidDate(value: string | null): value is string {
  if (value === null || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
}

export const storeSalesHandler = http.get('*/api/stores/:storeId/sales', async ({ params, request }) => {
  await delay(300 + Math.floor(Math.random() * 501))

  const storeId = String(params.storeId)
  if (!storeIds.has(storeId)) {
    return HttpResponse.json({ message: `Unknown store: ${storeId}` }, { status: 404 })
  }

  const url = new URL(request.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  if (!isValidDate(from) || !isValidDate(to)) {
    return HttpResponse.json({ message: 'Query parameters from and to must be valid YYYY-MM-DD dates.' }, { status: 400 })
  }

  const fromMs = Date.parse(`${from}T00:00:00.000Z`)
  const toExclusiveMs = Date.parse(`${to}T00:00:00.000Z`) + 86_400_000
  if (fromMs >= toExclusiveMs) {
    return HttpResponse.json({ message: 'The from date must not be after the to date.' }, { status: 400 })
  }

  if (Math.random() < 0.1) {
    return HttpResponse.json({ message: 'The mock sales service failed. Please try again.' }, { status: 500 })
  }

  const store = mockStores.find(({ storeId: candidate }) => candidate === storeId)!
  const allTransactions = mockTransactionsByStore.get(storeId)!
  const transactions = allTransactions.filter((transaction) => {
    const timestamp = Date.parse(transaction.timestamp)
    return timestamp >= fromMs && timestamp < toExclusiveMs
  })

  const response: StoreSalesResponse = {
    storeId: store.storeId,
    currency: store.currency,
    generatedAt: new Date().toISOString(),
    transactions,
  }

  return HttpResponse.json(response)
})

export const handlers = [storeSalesHandler]
