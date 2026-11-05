import {
  getDefaultSalesRange,
  paymentMethods,
  salesCategories,
  type PaymentMethod,
  type SalesCategory,
  type SalesTransaction,
} from './sales'

export interface MockStore {
  storeId: string
  currency: 'USD' | 'CAD'
}

export const mockStores = [
  { storeId: 'S-1042', currency: 'USD' },
  { storeId: 'S-2048', currency: 'CAD' },
] as const satisfies readonly MockStore[]

const transactionsPerStore = 1_000
const generatedAt = new Date()
const { from: firstDate } = getDefaultSalesRange(generatedAt)
const firstDateMs = Date.parse(`${firstDate}T00:00:00.000Z`)
const dateSpanMs = generatedAt.getTime() - firstDateMs + 1

function seededRandom(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0
    return state / 4_294_967_296
  }
}

function choose<T>(values: readonly T[], random: () => number): T {
  return values[Math.floor(random() * values.length)]
}

function makeTransactions(storeIndex: number, seed: number): SalesTransaction[] {
  const random = seededRandom(seed)

  return Array.from({ length: transactionsPerStore }, (_, index) => {
    const timestamp = new Date(firstDateMs + Math.floor(random() * dateSpanMs))
    const category: SalesCategory = choose(salesCategories, random)
    const paymentMethod: PaymentMethod = choose(paymentMethods, random)
    const items = 1 + Math.floor(random() * 12)
    const total = Math.round((1 + random() * 198) * 100) / 100
    const transactionNumber = storeIndex * transactionsPerStore + index + 1

    return {
      id: `T-${String(transactionNumber).padStart(6, '0')}`,
      timestamp: timestamp.toISOString(),
      category,
      paymentMethod,
      items,
      total,
    }
  }).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export const mockTransactionsByStore = new Map<string, SalesTransaction[]>(
  mockStores.map((store, index): [string, SalesTransaction[]] => [
    store.storeId,
    makeTransactions(index, 28_102_026 + index * 101),
  ]),
)
