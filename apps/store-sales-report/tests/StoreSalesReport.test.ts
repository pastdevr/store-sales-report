import { computed, ref, toValue, type ComputedRef, type Ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { StoreSalesResponse } from '@store-sales-report/data'
import { getDefaultSalesRange } from '@store-sales-report/data'
import StoreSalesReport from '../src/components/StoreSalesReport.vue'
import { useStoreSales } from '../src/composables/useStoreSales'
import { StoreSalesReportElement } from '../src/web-component'

const chartMock = vi.hoisted(() => {
  const instance = { setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }
  return { instance, init: vi.fn(() => instance) }
})

vi.mock('echarts/core', () => ({ init: chartMock.init, use: vi.fn() }))
vi.mock('echarts/charts', () => ({ BarChart: {} }))
vi.mock('echarts/components', () => ({ AriaComponent: {}, GridComponent: {}, TooltipComponent: {} }))
vi.mock('echarts/renderers', () => ({ CanvasRenderer: {} }))
vi.mock('../src/composables/useStoreSales', () => ({ useStoreSales: vi.fn() }))

const mockedUseStoreSales = vi.mocked(useStoreSales)

const response: StoreSalesResponse = {
  storeId: 'S-1042',
  currency: 'USD',
  generatedAt: '2026-10-28T09:15:00.000Z',
  transactions: [
    { id: 'T-1', timestamp: '2026-10-01T08:00:00.000Z', category: 'beverages', paymentMethod: 'card', items: 3, total: 12.47 },
    { id: 'T-2', timestamp: '2026-10-02T08:00:00.000Z', category: 'snacks', paymentMethod: 'cash', items: 2, total: 4.5 },
  ],
}

type RequestMock = {
  data: Ref<StoreSalesResponse | null>
  error: Ref<Error | null>
  isFetching: Ref<boolean>
  aborted: Ref<boolean>
  canAbort: ComputedRef<boolean>
  requestUrl: ComputedRef<string>
  execute: ReturnType<typeof vi.fn>
  abort: ReturnType<typeof vi.fn>
  onFetchError: ReturnType<typeof vi.fn>
}
const errorCallbacks: Array<(context: any) => void> = []

function makeRequestMock() {
  const data = ref<StoreSalesResponse | null>(null)
  const error = ref<Error | null>(null)
  const isFetching = ref(true)
  const aborted = ref(false)
  const requestUrl = computed(() => '/api/stores/S-1042/sales?from=2026-10-01&to=2026-10-30')
  const execute = vi.fn(async () => {
    isFetching.value = true
    error.value = null
  })
  const onFetchError = vi.fn((callback: (context: any) => void) => errorCallbacks.push(callback))

  return {
    data,
    error,
    isFetching,
    aborted,
    canAbort: computed(() => false),
    requestUrl,
    execute,
    abort: vi.fn(() => { aborted.value = true }),
    onFetchError,
  }
}

function mountReport(props: { storeId: string; language?: 'en' | 'es' | 'fr'; from?: string; to?: string; theme?: 'light' | 'dark' } = { storeId: 'S-1042' }) {
  return mount(StoreSalesReport, {
    props,
    global: {
      stubs: {
        DailyRevenueChart: true,
        CategoryRevenueTable: true,
      },
    },
  })
}

describe('StoreSalesReport', () => {
  let requests: RequestMock[]

  beforeEach(() => {
    requests = []
    errorCallbacks.length = 0
    mockedUseStoreSales.mockImplementation(() => {
      const request = makeRequestMock()
      requests.push(request)
      return request as unknown as ReturnType<typeof useStoreSales>
    })
  })

  afterEach(() => {
    mockedUseStoreSales.mockReset()
  })

  it('renders loading, then report metrics after data arrives and emits the response', async () => {
    const wrapper = mountReport({ storeId: 'S-1042', from: '2026-10-01', to: '2026-10-03' })
    expect(wrapper.text()).toContain('Loading sales data')

    requests[0]!.data.value = response
    requests[0]!.isFetching.value = false
    await flushPromises()

    expect(wrapper.text()).toContain('$16.97')
    expect(wrapper.text()).toContain('2')
    expect(wrapper.emitted('data-loaded')?.[0]?.[0]).toEqual(response)
  })

  it('reacts to locale, theme, date, and payment changes while emitting filter details', async () => {
    const range = getDefaultSalesRange()
    const wrapper = mountReport({ storeId: 'S-1042', language: 'en', theme: 'light', from: range.from, to: range.to })
    const request = requests[0]!
    request.data.value = {
      ...response,
      transactions: [
        ...response.transactions.map((transaction) => ({ ...transaction, timestamp: `${range.from}T08:00:00.000Z` })),
        { id: 'T-3', timestamp: `${range.to}T09:00:00.000Z`, category: 'beverages', paymentMethod: 'card', items: 1, total: 7.03 },
      ],
    }
    request.isFetching.value = false
    await flushPromises()

    await wrapper.findAll('select')[0]!.setValue('es')
    expect(wrapper.find('h1').text()).toBe('Informe de ventas de la tienda')
    await wrapper.setProps({ theme: 'dark', language: 'fr', from: range.to, to: range.to })
    expect(wrapper.find('.ssr-widget').attributes('data-theme')).toBe('dark')
    expect(wrapper.find('h1').text()).toBe('Rapport des ventes du magasin')
    expect((wrapper.find('input[type="date"]').element as HTMLInputElement).value).toBe(range.to)

    await wrapper.findAll('select')[1]!.setValue('card')
    await wrapper.find('input[type="date"]').setValue(range.from)
    await flushPromises()

    const changes = wrapper.emitted('filters-change')
    expect(changes?.at(-1)?.[0]).toEqual({ from: range.from, to: range.to, paymentMethod: 'card' })
    expect(wrapper.text()).toContain('1')
  })

  it('shows an error and retries when requested', async () => {
    const wrapper = mountReport()
    const request = requests[0]!
    request.error.value = new Error('Request failed')
    request.isFetching.value = false
    await flushPromises()

    expect(wrapper.text()).toContain('Sales data could not be loaded.')
    await wrapper.find('button').trigger('click')
    expect(request.execute).toHaveBeenCalledTimes(1)

    errorCallbacks[0]?.({
      error: new Error('Request failed'),
      response: { status: 503 },
      context: { url: request.requestUrl.value },
    })
    expect(wrapper.emitted('load-error')?.[0]?.[0]).toMatchObject({ storeId: 'S-1042', status: 503 })
  })

  it('keeps language and filter state independent between widget instances', async () => {
    const first = mountReport({ storeId: 'S-1042', language: 'en' })
    const second = mountReport({ storeId: 'S-2048', language: 'fr' })

    await first.findAll('select')[0]!.setValue('es')
    await first.findAll('select')[1]!.setValue('card')

    expect(first.find('h1').text()).toBe('Informe de ventas de la tienda')
    expect(second.find('h1').text()).toBe('Rapport des ventes du magasin')
    expect(requests).toHaveLength(2)
    expect(toValue(mockedUseStoreSales.mock.calls[0]![0].storeId)).toBe('S-1042')
    expect(toValue(mockedUseStoreSales.mock.calls[1]![0].storeId)).toBe('S-2048')
  })

  it('displays the empty state when the active filters match no transactions', async () => {
    const wrapper = mountReport()
    requests[0]!.data.value = { ...response, transactions: [] }
    requests[0]!.isFetching.value = false
    await flushPromises()

    expect(wrapper.text()).toContain('No transactions match these filters.')
  })

  it('exposes object-detail bubbling events from the Web Component', async () => {
    const element = document.createElement('store-sales-report') as StoreSalesReportElement
    element.setAttribute('store-id', 'S-1042')
    element.setAttribute('from', '2026-10-01')
    element.setAttribute('to', '2026-10-03')
    const received: CustomEvent[] = []
    document.body.addEventListener('data-loaded', (event) => received.push(event as CustomEvent), { once: true })
    document.body.append(element)
    const request = requests.at(-1)!

    request.data.value = response
    request.isFetching.value = false
    await flushPromises()

    expect(element.shadowRoot?.querySelector('h1')?.textContent).toBe('Store Sales Report')
    expect(received[0]?.detail).toEqual(response)
    expect(received[0]?.bubbles).toBe(true)
    expect(received[0]?.composed).toBe(true)
    element.setAttribute('theme', 'dark')
    await flushPromises()
    expect(element.shadowRoot?.querySelector('.ssr-widget')?.getAttribute('data-theme')).toBe('dark')
  })
})
