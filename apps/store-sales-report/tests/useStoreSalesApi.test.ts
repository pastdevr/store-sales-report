import { computed, nextTick, ref, toValue, type ComputedRef, type Ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getDefaultSalesRange } from '@store-sales-report/data'
import { useStoreSalesApi } from '../src/composables/useStoreSalesApi'

const fetchMocks = vi.hoisted(() => ({ useFetch: vi.fn() }))
vi.mock('@vueuse/core', () => ({ useFetch: fetchMocks.useFetch }))

describe('useStoreSalesApi', () => {
  let request: {
    canAbort: ComputedRef<boolean>
    execute: ReturnType<typeof vi.fn>
    abort: ReturnType<typeof vi.fn>
  }
  let canAbort: Ref<boolean>
  let fetchUrl: ReturnType<typeof computed<string>> | undefined

  beforeEach(() => {
    canAbort = ref(false)
    request = {
      canAbort: computed(() => canAbort.value),
      execute: vi.fn(async () => undefined),
      abort: vi.fn(() => { canAbort.value = false }),
    }
    fetchMocks.useFetch.mockImplementation((url: ReturnType<typeof computed<string>>) => {
      fetchUrl = url
      const builder: { get: () => typeof builder; json: () => typeof request } = {
        get: () => builder,
        json: () => request,
      }
      return builder
    })
  })

  afterEach(() => fetchMocks.useFetch.mockReset())

  it('builds a reactive, encoded request URL and restarts an active request on change', async () => {
    const storeId = ref('S 1042/West')
    const from = ref('2026-10-01')
    const to = ref('2026-10-03')
    const api = useStoreSalesApi({ storeId, from, to })

    expect(toValue(api.requestUrl)).toBe('/api/stores/S%201042%2FWest/sales?from=2026-10-01&to=2026-10-03')
    expect(fetchMocks.useFetch).toHaveBeenCalledOnce()
    expect(request.execute).toHaveBeenCalledOnce()

    canAbort.value = true
    from.value = '2026-10-02'
    await nextTick()

    expect(toValue(fetchUrl!)).toBe('/api/stores/S%201042%2FWest/sales?from=2026-10-02&to=2026-10-03')
    expect(request.abort).toHaveBeenCalledOnce()
    expect(request.execute).toHaveBeenCalledTimes(2)
  })

  it('uses the default range and aborts without fetching when disabled', async () => {
    const enabled = ref(true)
    const api = useStoreSalesApi({ storeId: 'S-1042', enabled })
    const { from, to } = getDefaultSalesRange()

    expect(toValue(api.requestUrl)).toBe(`/api/stores/S-1042/sales?from=${from}&to=${to}`)
    expect(request.execute).toHaveBeenCalledOnce()

    enabled.value = false
    await nextTick()

    expect(request.abort).toHaveBeenCalledOnce()
    expect(request.execute).toHaveBeenCalledOnce()
  })
})
