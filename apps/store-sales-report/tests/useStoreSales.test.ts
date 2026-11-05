import { computed, ref, toValue, type Ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { StoreSalesResponse, SalesTransaction } from '@store-sales-report/data'
import { salesCategories } from '@store-sales-report/data'
import { useStoreSales } from '../src/composables/useStoreSales'
import { useStoreSalesApi, type UseStoreSalesApiOptions } from '../src/composables/useStoreSalesApi'

const apiMocks = vi.hoisted(() => ({ useStoreSalesApi: vi.fn() }))
vi.mock('../src/composables/useStoreSalesApi', () => ({ useStoreSalesApi: apiMocks.useStoreSalesApi }))

const mockedUseStoreSalesApi = vi.mocked(useStoreSalesApi)

const transactions: SalesTransaction[] = [
  { id: 'T-1', timestamp: '2026-10-01T08:00:00.000Z', category: 'beverages', paymentMethod: 'card', items: 3, total: 12.47 },
  { id: 'T-2', timestamp: '2026-10-01T12:00:00.000Z', category: 'snacks', paymentMethod: 'cash', items: 2, total: 4.5 },
  { id: 'T-3', timestamp: '2026-10-02T08:00:00.000Z', category: 'beverages', paymentMethod: 'card', items: 1, total: 7.03 },
  { id: 'T-4', timestamp: '2026-10-03T08:00:00.000Z', category: 'lottery', paymentMethod: 'ebt', items: 1, total: 2.25 },
]

function makeApiRequest() {
  const data = ref<StoreSalesResponse | null>(null)
  const error = ref<Error | null>(null)
  const isFetching = ref(true)
  const aborted = ref(false)
  const requestUrl = computed(() => '/api/stores/S-1042/sales?from=2026-10-01&to=2026-10-03')
  const execute = vi.fn(async () => undefined)
  const abort = vi.fn(() => { aborted.value = true })
  const onFetchError = vi.fn()

  return {
    data,
    error,
    isFetching,
    aborted,
    canAbort: computed(() => false),
    requestUrl,
    execute,
    abort,
    onFetchError,
  }
}

function makeResponse(rows: SalesTransaction[]): StoreSalesResponse {
  return {
    storeId: 'S-1042',
    currency: 'USD',
    generatedAt: '2026-10-03T09:15:00.000Z',
    transactions: rows,
  }
}

describe('useStoreSales', () => {
  let requests: ReturnType<typeof makeApiRequest>[]
  let apiOptions: UseStoreSalesApiOptions[]

  beforeEach(() => {
    requests = []
    apiOptions = []
    mockedUseStoreSalesApi.mockImplementation((options) => {
      apiOptions.push(options)
      const request = makeApiRequest()
      requests.push(request)
      return request as unknown as ReturnType<typeof useStoreSalesApi>
    })
  })

  afterEach(() => mockedUseStoreSalesApi.mockReset())

  it('aggregates all report metrics, category totals, and inclusive daily revenue', () => {
    const from = ref('2026-10-01')
    const to = ref('2026-10-02')
    const paymentMethod = ref<'all' | 'card' | 'cash' | 'ebt' | 'mobile'>('all')
    const sales = useStoreSales({ storeId: 'S-1042', from, to, paymentMethod })
    requests[0]!.data.value = makeResponse(transactions)

    expect(sales.aggregated.value.metrics).toEqual({
      revenue: 24,
      transactionCount: 3,
      averageBasketValue: 8,
      itemsSold: 6,
    })
    expect(sales.aggregated.value.dailyRevenue).toEqual([
      { date: '2026-10-01', revenue: 16.97 },
      { date: '2026-10-02', revenue: 7.03 },
    ])
    expect(sales.aggregated.value.categories.find(({ category }) => category === 'beverages')).toEqual({
      category: 'beverages',
      revenue: 19.5,
      transactionCount: 2,
      itemsSold: 4,
    })
    expect(sales.aggregated.value.categories).toHaveLength(salesCategories.length)
  })

  it('reacts to date and payment filters across all derived sales', () => {
    const from = ref('2026-10-01')
    const to = ref('2026-10-03')
    const paymentMethod = ref<'all' | 'card' | 'cash' | 'ebt' | 'mobile'>('all')
    const sales = useStoreSales({ storeId: 'S-1042', from, to, paymentMethod })
    requests[0]!.data.value = makeResponse(transactions)

    paymentMethod.value = 'card'
    expect(sales.aggregated.value.metrics).toEqual({
      revenue: 19.5,
      transactionCount: 2,
      averageBasketValue: 9.75,
      itemsSold: 4,
    })
    expect(sales.aggregated.value.dailyRevenue.map(({ revenue }) => revenue)).toEqual([12.47, 7.03, 0])
    expect(sales.aggregated.value.categories.find(({ category }) => category === 'snacks')?.revenue).toBe(0)

    from.value = '2026-10-02'
    expect(sales.aggregated.value.transactions.map(({ id }) => id)).toEqual(['T-3'])
  })

  it('gates the API on a nonempty store ID and a valid date range', () => {
    const storeId = ref(' ')
    const from = ref('2026-02-30')
    const to = ref('2026-03-01')
    const sales = useStoreSales({ storeId, from, to, paymentMethod: 'all' })
    const enabled = apiOptions[0]!.enabled!

    expect(sales.hasStoreId.value).toBe(false)
    expect(sales.validRange.value).toBe(false)
    expect(toValue(enabled)).toBe(false)

    storeId.value = 'S-1042'
    from.value = '2026-03-01'
    expect(sales.hasStoreId.value).toBe(true)
    expect(sales.validRange.value).toBe(true)
    expect(toValue(enabled)).toBe(true)

    to.value = '2026-02-28'
    expect(sales.validRange.value).toBe(false)
    expect(toValue(enabled)).toBe(false)
  })

  it('exposes API request state and marks a loaded empty result', () => {
    const sales = useStoreSales({
      storeId: 'S-1042',
      from: '2026-10-01',
      to: '2026-10-03',
      paymentMethod: 'all',
    })
    const request = requests[0]!

    expect(sales.data).toBe(request.data)
    expect(sales.isFetching).toBe(request.isFetching)
    expect(sales.isEmpty.value).toBe(false)
    request.error.value = new Error('Request failed')
    expect(sales.error.value?.message).toBe('Request failed')
    request.data.value = makeResponse([])
    expect(sales.isEmpty.value).toBe(true)
    expect(sales.aggregated.value.metrics).toEqual({ revenue: 0, transactionCount: 0, averageBasketValue: 0, itemsSold: 0 })

    void sales.execute()
    expect(request.execute).toHaveBeenCalledOnce()
  })
})
